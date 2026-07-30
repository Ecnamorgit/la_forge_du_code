"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { transformJsx } from "@/lib/sandbox/jsx-transform";
import {
  PREVIEW_MOUNT_NAME_RE,
  buildPreviewSrcdoc,
  parsePreviewMessage,
  type PreviewErrorKind,
} from "@/lib/sandbox/react-preview";

/** Delai au-dela duquel on considere que l'iframe ne repondra pas. */
const READY_TIMEOUT_MS = 5000;

/**
 * Delai au-dela duquel on considere un rendu fige : une boucle qui ne se
 * termine jamais (`while (true)` dans le corps du composant) bloque le thread
 * unique de l'iframe DANS `root.render`, ce qui ne leve rien, ne declenche
 * aucune frontiere d'erreur, et n'appelle jamais `window.onerror` — le parent
 * n'entend tout simplement plus rien. `run-js.ts` utilise 3s pour une
 * execution headless en une seule passe ; ici le message doit en plus faire
 * l'aller-retour complet (poster `preview:render`, demonter, remonter,
 * peindre, poster `preview:rendered` en retour), d'ou une marge un peu plus
 * large.
 */
const RENDER_TIMEOUT_MS = 4000;

interface ReactPreviewProps {
  /** Code courant de l'editeur, non transforme. */
  code: string;
  /** Nom du composant a monter. Absent = chapitre sans apercu. */
  mount?: string;
  /** Incremente par le parent a chaque clic sur DEPLOYER. 0 = jamais deploye. */
  deployNonce: number;
  className?: string;
}

type Etat =
  | { phase: "attente" }
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
  const [pret, setPret] = useState(false);
  const [etat, setEtat] = useState<Etat>({ phase: "attente" });
  // Dernier code transforme, garde en file tant que l'iframe n'a pas dit `ready`.
  // Sans ca, un deploiement pendant le chargement de React serait perdu en
  // silence : un postMessage envoye trop tot n'est pas remis.
  const enAttenteRef = useRef<{ js: string; mount: string } | null>(null);
  // Force le remontage complet de l'iframe (nouvel element, nouveau contexte
  // de navigation) quand le chien de garde constate un rendu fige : une frame
  // bloquee dans une boucle synchrone ne se debloque jamais d'elle-meme.
  const [iframeKey, setIframeKey] = useState(0);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const arreterWatchdog = useCallback(() => {
    if (watchdogRef.current !== null) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  // Demarre (ou redemarre) le chien de garde apres un envoi de rendu. Il
  // s'arrete tout seul sur `rendered` ou `error` ; s'il arrive a echeance,
  // c'est qu'aucun des deux n'est jamais arrive, donc que la frame est figee.
  const demarrerWatchdog = useCallback(() => {
    arreterWatchdog();
    watchdogRef.current = setTimeout(() => {
      watchdogRef.current = null;
      // La frame gelee ne repondra plus jamais : on la remplace plutot que
      // d'attendre. `pret` retombe a false pour que le prochain deploiement
      // attende la nouvelle poignee de main `ready` au lieu de poster dans le
      // vide.
      setPret(false);
      enAttenteRef.current = null;
      setEtat({
        phase: "erreur",
        kind: "runtime",
        message:
          "Le rendu ne repond plus, probablement une boucle qui ne se termine jamais " +
          "(par exemple un while (true) dans le composant). L'apercu a ete redemarre : " +
          "corrige ton code et redeploie.",
      });
      setIframeKey((k) => k + 1);
    }, RENDER_TIMEOUT_MS);
  }, [arreterWatchdog]);

  const envoyer = useCallback((payload: { js: string; mount: string }) => {
    const fenetre = iframeRef.current?.contentWindow;
    if (!fenetre) return;
    // L'iframe est a origine opaque : "*" est la seule cible possible pour
    // postMessage. Acceptable, la charge utile est le code de l'apprenant
    // lui-meme et non un secret ; l'iframe verifie event.source === parent.
    fenetre.postMessage({ type: "preview:render", ...payload }, "*");
  }, []);

  // Envoie ET arme le chien de garde : les deux points d'envoi (immediat si
  // `pret`, differe a la reception de `ready` sinon) doivent l'un comme
  // l'autre surveiller la reponse.
  const envoyerEtSurveiller = useCallback(
    (payload: { js: string; mount: string }) => {
      envoyer(payload);
      demarrerWatchdog();
    },
    [envoyer, demarrerWatchdog]
  );

  // Ecoute des messages de l'iframe.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const msg = parsePreviewMessage(event, iframeRef.current?.contentWindow ?? null);
      if (!msg) return;

      if (msg.type === "ready") {
        setPret(true);
        const enFile = enAttenteRef.current;
        if (enFile) {
          enAttenteRef.current = null;
          envoyerEtSurveiller(enFile);
        }
        return;
      }

      if (msg.type === "rendered") {
        arreterWatchdog();
        return;
      }

      arreterWatchdog();
      setEtat({ phase: "erreur", kind: msg.kind, message: msg.message });
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [envoyerEtSurveiller, arreterWatchdog]);

  // Filet : si `ready` n'arrive jamais, l'apercu se declare indisponible et la
  // lecon continue. L'apercu n'est jamais un chemin critique.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!pret) setEtat((e) => (e.phase === "attente" ? { phase: "indisponible" } : e));
    }, READY_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [pret]);

  // Le chien de garde ne doit pas survivre au demontage du composant, ni
  // laisser un timer courir apres qu'on a quitte la lecon.
  useEffect(() => arreterWatchdog, [arreterWatchdog]);

  // Le code courant, lu au moment du deploiement. Un ref plutot qu'une
  // dependance de l'effet de deploiement plus bas : mettre `code` dans SES
  // deps remonterait l'apercu a chaque frappe au clavier, et le desactiver
  // avec exhaustive-deps masquerait le probleme au lieu de le resoudre. La
  // synchronisation elle-meme passe par un effet (plutot qu'une ecriture
  // directe pendant le rendu) : react-hooks/refs interdit d'ecrire un ref
  // pendant le rendu, meme pour ce patron de "derniere valeur connue".
  const codeRef = useRef(code);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  // Transformation + envoi a chaque deploiement.
  useEffect(() => {
    if (deployNonce === 0 || !mount) return;

    if (!PREVIEW_MOUNT_NAME_RE.test(mount)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reaction a une donnee de cours invalide (previewMount malforme), pas une resynchronisation externe differee
      setEtat({
        phase: "erreur",
        kind: "mount",
        message: `Nom de composant invalide dans les donnees du cours : « ${mount} ».`,
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
      const payload = { js: r.js, mount };
      if (pret) envoyerEtSurveiller(payload);
      else enAttenteRef.current = payload;
    })();

    return () => {
      annule = true;
    };
  }, [deployNonce, mount, pret, envoyerEtSurveiller]);

  // Construit apres le montage, jamais au rendu : `buildPreviewSrcdoc` a besoin
  // de `window.location.origin`, et un repli "" cote serveur puis la vraie
  // valeur cote client provoquerait un ecart d'hydratation sur l'attribut.
  const [srcdoc, setSrcdoc] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture ponctuelle de l'origine au montage
    setSrcdoc(buildPreviewSrcdoc(window.location.origin));
  }, []);

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
      <div className="shrink-0 border-b border-nebula-border/40 px-5 py-2 font-tech text-[10px] uppercase tracking-[0.3em] text-nebula-text-dim">
        {"> "}Apercu du composant
      </div>

      {etat.phase === "erreur" && (
        <div className="shrink-0 border-b border-nebula-red/40 bg-nebula-red/10 px-5 py-3">
          <p className="mb-1 font-tech text-[10px] uppercase tracking-widest text-nebula-red">
            {etat.kind === "transform"
              ? "Syntaxe refusee"
              : etat.kind === "mount"
                ? "Composant introuvable"
                : "Erreur a l'execution"}
          </p>
          <p className="font-code text-xs leading-relaxed text-nebula-red/90">{etat.message}</p>
        </div>
      )}

      {etat.phase === "indisponible" ? (
        <p className="px-5 py-4 font-body text-sm text-nebula-text-dim">
          Apercu indisponible. Ton code est toujours analyse et validable.
        </p>
      ) : (
        <>
          {deployNonce === 0 && (
            <p className="px-5 py-4 font-body text-sm text-nebula-text-dim">
              Deploie pour voir ton composant s&apos;executer.
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
              title="Apercu du composant React"
            />
          )}
        </>
      )}
    </div>
  );
}
