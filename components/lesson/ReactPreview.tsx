"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { transformJsx } from "@/lib/sandbox/jsx-transform";
import {
  PREVIEW_MOUNT_NAME_RE,
  buildPreviewSrcdoc,
  parsePreviewMessage,
  type PreviewErrorKind,
} from "@/lib/sandbox/react-preview";

/** Délai au-delà duquel on considère que l'iframe ne répondra pas. */
const READY_TIMEOUT_MS = 5000;

/**
 * Délai au-delà duquel on considère un rendu figé : une boucle qui ne se
 * termine jamais (`while (true)` dans le corps du composant) bloque le thread
 * unique de l'iframe, ce qui ne lève rien, ne déclenche aucune frontière
 * d'erreur et n'appelle jamais `window.onerror` — le parent n'entend plus rien.
 * `run-js.ts` utilise 3 s pour une exécution headless ; ici le message doit en
 * plus faire l'aller-retour complet (poster, démonter, remonter, commiter,
 * acquitter), d'où une marge un peu plus large.
 */
const RENDER_TIMEOUT_MS = 4000;

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
  | { phase: "sans-apercu" }
  | { phase: "indisponible" }
  | { phase: "rendu" }
  | { phase: "erreur"; kind: PreviewErrorKind; message: string };

export default function ReactPreview({
  code,
  mount,
  deployNonce,
  className = "",
}: ReactPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [etat, setEtat] = useState<Etat>({ phase: "attente" });

  // La disponibilité de l'iframe vit dans un ref, PAS dans un état.
  //
  // En dépendance de l'effet de déploiement, elle provoquait deux bugs : le
  // chien de garde, qui la remet à false, relançait l'effet et effaçait sa
  // propre explication tout en redéployant le code figé en boucle ; et un
  // déploiement lancé avant la poignée de main montait le composant deux fois,
  // une fois par la file et une fois par la relance de l'effet.
  const pretRef = useRef(false);
  const [pretPourFilet, setPretPourFilet] = useState(false);

  // Dernier code transformé, gardé en file tant que l'iframe n'a pas dit
  // `ready` : un postMessage envoyé trop tôt n'est jamais remis, il serait
  // perdu en silence.
  const enAttenteRef = useRef<{ js: string; mount: string; nonce: number } | null>(null);

  // Force le remontage complet de l'iframe quand le chien de garde constate un
  // rendu figé : une frame bloquée dans une boucle synchrone ne se débloque
  // jamais d'elle-même.
  const [iframeKey, setIframeKey] = useState(0);

  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Identifie le rendu en cours. Sans lui, l'accusé du rendu n désarmerait le
  // chien de garde armé pour le rendu n+1.
  const nonceRef = useRef(0);

  const arreterWatchdog = useCallback(() => {
    if (watchdogRef.current !== null) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  const demarrerWatchdog = useCallback(() => {
    arreterWatchdog();
    watchdogRef.current = setTimeout(() => {
      watchdogRef.current = null;
      // La frame gelée ne répondra plus jamais : on la remplace. `pretRef`
      // retombe à false pour que le prochain déploiement attende la nouvelle
      // poignée de main au lieu de poster dans le vide — et comme c'est un ref,
      // ça ne relance pas l'effet de déploiement, donc ce message survit.
      pretRef.current = false;
      setPretPourFilet(false);
      enAttenteRef.current = null;
      setEtat({
        phase: "erreur",
        kind: "runtime",
        message:
          "Le rendu ne répond plus, probablement une boucle qui ne se termine jamais " +
          "(par exemple un while (true) dans le composant). L'aperçu a été redémarré : " +
          "corrige ton code et redéploie.",
      });
      setIframeKey((k) => k + 1);
    }, RENDER_TIMEOUT_MS);
  }, [arreterWatchdog]);

  /** Poste vers l'iframe. Renvoie false si la frame n'est pas joignable. */
  const envoyer = useCallback((payload: { js: string; mount: string; nonce: number }) => {
    const fenetre = iframeRef.current?.contentWindow;
    if (!fenetre) return false;
    // L'iframe est à origine opaque : "*" est la seule cible possible pour
    // postMessage. Acceptable, la charge utile est le code de l'apprenant
    // lui-même et non un secret ; l'iframe vérifie `event.source === parent`.
    fenetre.postMessage({ type: "preview:render", ...payload }, "*");
    return true;
  }, []);

  // N'arme le chien de garde que si l'envoi a réellement eu lieu : sinon son
  // message parlerait d'une boucle infinie pour une frame simplement absente.
  const envoyerEtSurveiller = useCallback(
    (payload: { js: string; mount: string; nonce: number }) => {
      if (envoyer(payload)) demarrerWatchdog();
    },
    [envoyer, demarrerWatchdog]
  );

  // Écoute des messages de l'iframe.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const msg = parsePreviewMessage(event, iframeRef.current?.contentWindow ?? null);
      if (!msg) return;

      if (msg.type === "ready") {
        pretRef.current = true;
        setPretPourFilet(true);
        const enFile = enAttenteRef.current;
        if (enFile) {
          enAttenteRef.current = null;
          envoyerEtSurveiller(enFile);
        }
        return;
      }

      if (msg.type === "rendered") {
        // Un accusé qui ne correspond pas au rendu courant est périmé : il ne
        // doit pas désarmer la surveillance du rendu en cours.
        if (msg.nonce === nonceRef.current) arreterWatchdog();
        return;
      }

      arreterWatchdog();
      setEtat({ phase: "erreur", kind: msg.kind, message: msg.message });
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [envoyerEtSurveiller, arreterWatchdog]);

  // Filet : si `ready` n'arrive jamais, l'aperçu se déclare indisponible et la
  // leçon continue. L'aperçu n'est jamais un chemin critique.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!pretRef.current) {
        setEtat((e) => (e.phase === "attente" ? { phase: "indisponible" } : e));
      }
    }, READY_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [pretPourFilet, iframeKey]);

  // Le chien de garde ne doit pas survivre au démontage du composant.
  useEffect(() => arreterWatchdog, [arreterWatchdog]);

  // Chapitre sans aperçu (chapitre 4, exempté) : on le dit, au lieu de laisser
  // une iframe vide et muette occuper le panneau.
  useEffect(() => {
    if (!mount) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- dérivé d'une donnée de cours, pas une resynchronisation différée
      setEtat({ phase: "sans-apercu" });
    }
  }, [mount]);

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
      const r = await transformJsx(codeRef.current);
      if (annule) return;

      if (!r.ok) {
        setEtat({ phase: "erreur", kind: "transform", message: r.error });
        return;
      }

      setEtat({ phase: "rendu" });
      nonceRef.current += 1;
      const payload = { js: r.js, mount, nonce: nonceRef.current };
      if (pretRef.current) envoyerEtSurveiller(payload);
      else enAttenteRef.current = payload;
    })();

    return () => {
      annule = true;
    };
  }, [deployNonce, mount, envoyerEtSurveiller]);

  // Construit après le montage, jamais au rendu : `buildPreviewSrcdoc` a besoin
  // de `window.location.origin`, et un repli "" côté serveur puis la vraie
  // valeur côté client provoquerait un écart d'hydratation sur l'attribut.
  const [srcdoc, setSrcdoc] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture ponctuelle de l'origine au montage
    setSrcdoc(buildPreviewSrcdoc(window.location.origin));
  }, []);

  const sansIframe = etat.phase === "indisponible" || etat.phase === "sans-apercu";

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
      <div className="shrink-0 border-b border-nebula-border/40 px-5 py-2 font-tech text-[10px] uppercase tracking-[0.3em] text-nebula-text-dim">
        {"> "}Aperçu du composant
      </div>

      {etat.phase === "erreur" && (
        <div className="shrink-0 border-b border-nebula-red/40 bg-nebula-red/10 px-5 py-3">
          <p className="mb-1 font-tech text-[10px] uppercase tracking-widest text-nebula-red">
            {etat.kind === "transform"
              ? "Syntaxe refusée"
              : etat.kind === "mount"
                ? "Composant introuvable"
                : "Erreur à l'exécution"}
          </p>
          <p className="font-code text-xs leading-relaxed text-nebula-red/90">{etat.message}</p>
        </div>
      )}

      {etat.phase === "sans-apercu" && (
        <p className="px-5 py-4 font-body text-sm leading-relaxed text-nebula-text-dim">
          Ce chapitre n&apos;a pas d&apos;aperçu : il enseigne la navigation, qui demande un
          routeur autour de tes composants. Ton code reste analysé et validable normalement.
        </p>
      )}

      {etat.phase === "indisponible" && (
        // Porte à sens unique, volontairement : l'iframe est démontée, donc un
        // `ready` tardif ne peut plus être honoré. Le panneau s'explique, et la
        // validation continue de fonctionner — l'aperçu n'est pas critique.
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
          {srcdoc !== null && (
            <iframe
              key={iframeKey}
              ref={iframeRef}
              srcDoc={srcdoc}
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
