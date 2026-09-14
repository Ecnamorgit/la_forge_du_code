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
  /** Incrémenté par le parent à chaque clic sur DÉPLOYER. 0 = jamais déployé. */
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
 * Une note sur ce qui n'est PAS ici : il n'y a pas de chien de garde côté
 * parent. La conception initiale en prévoyait un — poster le code, et remplacer
 * l'iframe si aucun accusé n'arrivait. Vérifié au navigateur le 2026-07-30 :
 * **ça ne peut pas fonctionner.** Une iframe `srcdoc` à origine opaque partage
 * le thread principal du parent dans Chromium, donc une boucle synchrone dans
 * le composant gèle l'onglet entier et le `setTimeout` du parent ne s'exécute
 * jamais. L'onglet est resté figé 58 secondes.
 *
 * Puisqu'aucune récupération n'est possible après l'envoi, on refuse d'envoyer :
 * voir `lib/sandbox/loop-guard.ts`.
 */
export default function ReactPreview({
  code,
  mount,
  deployNonce,
  className = "",
}: ReactPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [etat, setEtat] = useState<Etat>({ phase: "attente" });

  // La disponibilité de l'iframe vit dans un ref, PAS dans un état : en
  // dépendance de l'effet de déploiement, elle faisait monter le composant deux
  // fois quand un déploiement précédait la poignée de main.
  const pretRef = useRef(false);

  // Dernier code transformé, gardé en file tant que l'iframe n'a pas dit
  // `ready` : un postMessage envoyé trop tôt n'est jamais remis, il serait
  // perdu en silence.
  const enAttenteRef = useRef<{ js: string; mount: string } | null>(null);
  const fileRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const arreterAttenteFile = useCallback(() => {
    if (fileRef.current !== null) {
      clearTimeout(fileRef.current);
      fileRef.current = null;
    }
  }, []);

  /**
   * Surveille un déploiement mis en file. Sans ça, une iframe dont le script ne
   * démarre jamais laisserait la charge utile en attente indéfiniment, et le
   * filet initial ne rattrape que l'état de départ — l'apprenant resterait
   * devant un cadre blanc muet.
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
    // L'iframe est à origine opaque : "*" est la seule cible possible pour
    // postMessage. Acceptable, la charge utile est le code de l'apprenant
    // lui-même et non un secret ; l'iframe vérifie `event.source === parent`.
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
  // déployé, l'aperçu se déclare indisponible et la leçon continue. L'aperçu
  // n'est jamais un chemin critique.
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

  // Le code courant, lu au moment du déploiement. Un ref plutôt qu'une
  // dépendance de l'effet de déploiement : mettre `code` dans ses deps
  // remonterait l'aperçu à chaque frappe au clavier.
  const codeRef = useRef(code);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  // Transformation + envoi à chaque déploiement.
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

      // Garde-fou AVANT toute transformation : une fois le code envoyé, une
      // boucle infinie gèle l'onglet et plus rien ne peut la rattraper.
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
      // interrompues à l'exécution, au lieu de figer l'onglet (constat EXE-02).
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

  // URL du document du bac à sable, sur son origine DÉDIÉE (constat EXE-03) :
  // l'iframe le charge par `src` et non `srcDoc`, pour que son exécution porte
  // sa propre CSP permissive au lieu d'hériter de celle du site. Résolue après
  // le montage : `sandboxOriginFor` a besoin de `window.location.origin`, et un
  // repli "" côté serveur puis la vraie valeur côté client provoquerait un
  // écart d'hydratation sur l'attribut `src`.
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
