"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { transformJsx } from "@/lib/sandbox/jsx-transform";
import { detecterBoucleInfinie, messageBoucleInfinie } from "@/lib/sandbox/loop-guard";
import { protegerBoucles } from "@/lib/sandbox/loop-protect";
import {
  PREVIEW_MOUNT_NAME_RE,
  parsePreviewMessage,
  type PreviewErrorKind,
} from "@/lib/sandbox/react-preview";
import { SANDBOX_PATH, sandboxOriginFor } from "@/lib/sandbox/sandbox-origin";

/** Délai au-delà duquel on considère que l'iframe ne répondra jamais. */
const READY_TIMEOUT_MS = 5000;

interface ReactPreviewProps {
  /** Code courant de l'éditeur, non transformé. */
  code: string;
  /** Nom du composant à monter. Absent = chapitre sans aperçu. */
  mount?: string;
  /** Incrémenté par le parent à chaque déploiement ; 0 tant que rien n'est déployé. */
  deployNonce: number;
  className?: string;
}

type Etat =
  | { phase: "attente" }
  | { phase: "indisponible" }
  | { phase: "rendu" }
  | { phase: "erreur"; kind: PreviewErrorKind; message: string };

/**
 * Aperçu exécuté du composant de l'apprenant.
 *
 * Pas de chien de garde côté parent : dans Chromium, l'iframe peut partager le
 * thread principal de la page, si bien qu'une boucle synchrone gèle tout
 * l'onglet et qu'aucun minuteur du parent ne s'exécute. Aucune récupération
 * n'étant possible après l'envoi, le code suspect n'est pas envoyé (voir
 * `lib/sandbox/loop-guard.ts`).
 */
export default function ReactPreview({
  code,
  mount,
  deployNonce,
  className = "",
}: ReactPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [etat, setEtat] = useState<Etat>({ phase: "attente" });

  // Disponibilité de l'iframe dans un ref et non un état : en dépendance de
  // l'effet de déploiement, elle ferait monter le composant deux fois quand
  // un déploiement précède la poignée de main.
  const pretRef = useRef(false);

  // Dernier code transformé, gardé en file tant que l'iframe n'a pas envoyé
  // `ready` : un postMessage envoyé trop tôt est perdu sans erreur.
  const enAttenteRef = useRef<{ js: string; mount: string } | null>(null);
  const fileRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const arreterAttenteFile = useCallback(() => {
    if (fileRef.current !== null) {
      clearTimeout(fileRef.current);
      fileRef.current = null;
    }
  }, []);

  /**
   * Surveille un déploiement mis en file : si le script de l'iframe ne démarre
   * jamais, l'apprenant resterait devant un cadre blanc (le filet initial ne
   * couvre que l'état de départ).
   */
  const demarrerAttenteFile = useCallback(() => {
    arreterAttenteFile();
    fileRef.current = setTimeout(() => {
      fileRef.current = null;
      if (pretRef.current) return;
      enAttenteRef.current = null;
      setEtat({ phase: "indisponible" });
    }, READY_TIMEOUT_MS);
  }, [arreterAttenteFile]);

  /** Poste vers l'iframe. Renvoie false si la frame n'est pas joignable. */
  const envoyer = useCallback((payload: { js: string; mount: string }) => {
    const fenetre = iframeRef.current?.contentWindow;
    if (!fenetre) return false;
    // Iframe à origine opaque : "*" est la seule cible possible. La charge
    // utile (le code de l'apprenant) n'est pas un secret, et l'iframe vérifie
    // `event.source === parent`.
    fenetre.postMessage({ type: "preview:render", ...payload }, "*");
    return true;
  }, []);

  // Si l'envoi échoue, la charge repart en file plutôt que d'être perdue.
  const envoyerOuMettreEnFile = useCallback(
    (payload: { js: string; mount: string }) => {
      if (envoyer(payload)) return;
      enAttenteRef.current = payload;
      demarrerAttenteFile();
    },
    [envoyer, demarrerAttenteFile]
  );

  // Écoute des messages de l'iframe.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const msg = parsePreviewMessage(event, iframeRef.current?.contentWindow ?? null);
      if (!msg) return;

      if (msg.type === "ready") {
        pretRef.current = true;
        arreterAttenteFile();
        const enFile = enAttenteRef.current;
        if (enFile) {
          enAttenteRef.current = null;
          envoyerOuMettreEnFile(enFile);
        }
        return;
      }

      arreterAttenteFile();
      setEtat({ phase: "erreur", kind: msg.kind, message: msg.message });
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [envoyerOuMettreEnFile, arreterAttenteFile]);

  // Filet initial : si `ready` n'arrive jamais alors que rien n'a encore été
  // déployé, l'aperçu se déclare indisponible et la leçon continue.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!pretRef.current) {
        setEtat((e) => (e.phase === "attente" ? { phase: "indisponible" } : e));
      }
    }, READY_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  // Aucun minuteur ne doit survivre au démontage du composant.
  useEffect(() => arreterAttenteFile, [arreterAttenteFile]);

  // Code courant lu au déploiement, via un ref : mettre `code` dans les deps
  // de l'effet de déploiement remonterait l'aperçu à chaque frappe.
  const codeRef = useRef(code);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  // Transformation et envoi à chaque déploiement.
  useEffect(() => {
    if (deployNonce === 0 || !mount) return;

    if (!PREVIEW_MOUNT_NAME_RE.test(mount)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- réaction à une donnée de cours invalide, pas une resynchronisation différée
      setEtat({
        phase: "erreur",
        kind: "mount",
        message: `Nom de composant invalide dans les données du cours : « ${mount} ».`,
      });
      return;
    }

    let annule = false;
    void (async () => {
      const source = codeRef.current;

      // Garde-fou avant toute transformation : une boucle infinie déjà
      // envoyée ne peut plus être rattrapée.
      const boucle = detecterBoucleInfinie(source);
      if (boucle) {
        setEtat({ phase: "erreur", kind: "boucle", message: messageBoucleInfinie(boucle) });
        return;
      }

      const r = await transformJsx(source);
      if (annule) return;

      if (!r.ok) {
        setEtat({ phase: "erreur", kind: "transform", message: r.error });
        return;
      }

      setEtat({ phase: "rendu" });
      // Les boucles que le filtre littéral ci-dessus laisse passer sont
      // interrompues à l'exécution, au lieu de figer l'onglet (audit EXE-02).
      const payload = { js: protegerBoucles(r.js), mount };
      if (pretRef.current) {
        envoyerOuMettreEnFile(payload);
      } else {
        enAttenteRef.current = payload;
        demarrerAttenteFile();
      }
    })();

    return () => {
      annule = true;
    };
  }, [deployNonce, mount, envoyerOuMettreEnFile, demarrerAttenteFile]);

  // Document du bac à sable sur son origine dédiée (audit EXE-03), chargé par
  // `src` : un `srcDoc` hériterait de la CSP du site. Résolu après le montage,
  // car `sandboxOriginFor` a besoin de `window.location.origin` ; le calculer
  // au rendu créerait un écart d'hydratation sur `src`.
  const [sandboxSrc, setSandboxSrc] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture ponctuelle de l'origine au montage
    setSandboxSrc(sandboxOriginFor(window.location.origin) + SANDBOX_PATH);
  }, []);

  // Dérivé au rendu plutôt que posé par un effet : un effet ferait clignoter
  // l'invitation « Déploie… » pendant une frame sur un chapitre qui n'a jamais
  // d'aperçu, et resterait bloqué si `mount` devenait défini plus tard.
  const sansApercu = !mount;
  const sansIframe = sansApercu || etat.phase === "indisponible";

  const titreErreur =
    etat.phase === "erreur"
      ? etat.kind === "transform"
        ? "Syntaxe refusée"
        : etat.kind === "mount"
          ? "Composant introuvable"
          : etat.kind === "boucle"
            ? "Boucle sans fin"
            : "Erreur à l'exécution"
      : "";

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
      <div className="shrink-0 border-b border-nebula-border/40 px-5 py-2 font-tech text-[10px] uppercase tracking-[0.3em] text-nebula-text-dim">
        {"> "}Aperçu du composant
      </div>

      {etat.phase === "erreur" && (
        <div className="shrink-0 border-b border-nebula-red/40 bg-nebula-red/10 px-5 py-3">
          <p className="mb-1 font-tech text-[10px] uppercase tracking-widest text-nebula-red">
            {titreErreur}
          </p>
          <p className="font-code text-xs leading-relaxed text-nebula-red/90">{etat.message}</p>
        </div>
      )}

      {sansApercu && (
        <p className="px-5 py-4 font-body text-sm leading-relaxed text-nebula-text-dim">
          Ce chapitre n&apos;a pas d&apos;aperçu : il enseigne la navigation, qui demande un
          routeur autour de tes composants. Ton code reste analysé et validable normalement.
        </p>
      )}

      {!sansApercu && etat.phase === "indisponible" && (
        // L'iframe est démontée ici, mais l'état n'est pas verrouillé : un
        // déploiement ultérieur la remonte, elle envoie une nouvelle poignée de
        // main et l'aperçu repart.
        <p className="px-5 py-4 font-body text-sm text-nebula-text-dim">
          Aperçu indisponible. Ton code est toujours analysé et validable.
        </p>
      )}

      {!sansIframe && (
        <>
          {deployNonce === 0 && (
            <p className="px-5 py-4 font-body text-sm text-nebula-text-dim">
              Déploie pour voir ton composant s&apos;exécuter.
            </p>
          )}
          {sandboxSrc !== null && (
            <iframe
              ref={iframeRef}
              src={sandboxSrc}
              className={`min-h-0 flex-1 border-none bg-white ${
                deployNonce === 0 ? "hidden" : "block"
              }`}
              sandbox="allow-scripts"
              title="Aperçu du composant React"
            />
          )}
        </>
      )}
    </div>
  );
}
