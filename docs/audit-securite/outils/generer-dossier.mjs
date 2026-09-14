// Genere un dossier BLACKPROOF (proofpack v3) a partir d'un fichier de donnees d'audit.
// Usage : node generer-dossier.mjs <depot> <donnees.mjs> <dossier-sortie>
//
// Les preuves tirees du code sont lues dans le commit audite (`git show`), pas dans
// l'arbre de travail : leur empreinte reste verifiable apres les corrections, par
// `git show <commit>:<fichier> | sha256sum`.
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [repo, dataFile, out] = process.argv.slice(2);
if (!repo || !dataFile || !out) throw new Error("usage : node generer-dossier.mjs <depot> <donnees.mjs> <sortie>");
const { data } = await import(pathToFileURL(path.resolve(dataFile)).href);
fs.mkdirSync(path.join(out, "annexes"), { recursive: true });

const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
// Canonisation BLACKPROOF : cles triees recursivement, sans espaces.
// Verifie sur proofpack-demo.json : reproduit l'empreinte publiee.
const canon = (v) =>
  Array.isArray(v)
    ? "[" + v.map(canon).join(",") + "]"
    : v && typeof v === "object"
      ? "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}"
      : JSON.stringify(v);

const { slug, date, commit, caseInfo, questions, evidence, debts } = data;
const caseId = `case_${slug}`;
const now = `${date}T00:00:00.000Z`;
const stamp = date.replaceAll("-", "");
const gitShow = (file) => execFileSync("git", ["-C", repo, "show", `${commit}:${file}`]);

// Annexe generee : carte des routes.
fs.writeFileSync(path.join(out, "annexes", "carte-des-routes.md"), data.routeMapMd);

// --- preuves : empreinte calculee sur le fichier du commit audite, ou sur l'annexe
const evidenceOut = evidence.map(({ repoFile, annexFile, ...e }) => {
  const rel = repoFile ?? `annexes/${annexFile}`;
  const bytes = repoFile ? gitShow(repoFile) : fs.readFileSync(path.join(out, "annexes", annexFile));
  return {
    ...e,
    caseId,
    referenceType: "document-hash",
    referenceId: repoFile ? `${commit}:${repoFile}` : rel,
    fileName: path.basename(rel),
    fileUri: repoFile ? `git://${commit}/${repoFile}` : `local://${rel}`,
    documentHash: "sha256:" + sha(bytes),
    ...(repoFile ? { sourceSystem: `Dépôt Git, commit ${commit}` } : {}),
    observedAt: now,
    validator: "Joan (auto-evaluation assistee)",
    validatedAt: now,
    version: date,
    history: [`${date}: preuve relevee pendant l'audit`],
  };
});

// --- questionnaire source (texte, une question par ligne)
const qTxt = questions.map((q, i) => `${i + 1}. ${q.text}`).join("\n") + "\n";
const qFile = `questionnaire-${slug}.txt`;
fs.writeFileSync(path.join(out, qFile), qTxt);

// --- scores (methode simple, documentee dans la note de synthese)
const evById = Object.fromEntries(evidenceOut.map((e) => [e.id, e]));
const answered = questions.filter((q) => q.answerText).length;
const covered = questions.filter((q) => q.evidenceIds.some((id) => evById[id]?.status === "available")).length;
const strong = evidenceOut.filter((e) => e.strength === "strong" && e.status === "available").length;
const ready = questions.filter((q) => q.answerExportStatus === "ready").length;
const sevW = { critical: 25, high: 12, medium: 5, low: 2 };
const summary = {
  questionCount: questions.length,
  evidenceCount: evidenceOut.length,
  proofDebtCount: debts.length,
  criticalDebtCount: debts.filter((d) => d.severity === "critical").length,
  highDebtCount: debts.filter((d) => d.severity === "high").length,
  responseCompletenessScore: Math.round((100 * answered) / questions.length),
  evidenceCoverageScore: Math.round((100 * covered) / questions.length),
  evidenceQualityFreshnessScore: Math.round((100 * strong) / evidenceOut.length),
  exportReadinessScore: Math.round((100 * ready) / questions.length),
  proofDebtScore: Math.max(0, 100 - debts.reduce((s, d) => s + sevW[d.severity], 0)),
};

const pack = {
  formatVersion: "blackproof-proofpack-v3",
  schemaVersion: "blackproof-proofpack-schema-v3",
  id: `proofpack_${slug}_${stamp}`,
  revisionId: `revision_${slug}_${stamp}`,
  case: { id: caseId, ...caseInfo, createdAt: now, updatedAt: now, status: "ready" },
  sourceQuestionnaire: {
    fileName: qFile,
    format: "text",
    importedAt: now,
    sha256: "sha256:" + sha(qTxt),
    canonicalizationVersion: "blackproof-questionnaire-canonicalization-v2",
    size: Buffer.byteLength(qTxt),
  },
  questions: questions.map((q) => ({ ...q, caseId })),
  evidence: evidenceOut,
  // Le schema v3 refuse les champs inconnus : livrable, echeance et constats restent dans le CSV.
  debts: debts.map((d) => ({
    id: d.id, kind: d.kind, caseId, questionId: d.questionId, evidenceId: d.evidenceId,
    severity: d.severity, reason: d.reason, recommendedAction: d.recommendedAction,
  })),
  deliveryHistory: [],
  summary,
  methodVersion: "blackproof-method-v0.1.0-alpha",
  generatedAt: now,
};
pack.fingerprint = "bp_sha256_" + sha(canon(pack));

const files = {};
const write = (name, content, role, description) => {
  fs.writeFileSync(path.join(out, name), content);
  files[name] = { role, description, bytes: Buffer.from(content) };
};

write(`proofpack-${slug}.json`, JSON.stringify(pack, null, 2) + "\n", "machine_contract",
  "ProofPack machine-readable (schema v3) avec liens, resume et empreinte.");

// --- CSV (separateur ; comme la demo)
const cell = (v) => {
  const s = Array.isArray(v) ? v.join(" | ") : v == null ? "" : String(v);
  return /[;"\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};
const csv = (cols, rows) => [cols.join(";"), ...rows.map((r) => r.map(cell).join(";"))].join("\n") + "\n";

write(`registre-preuves-${slug}.csv`, csv(
  ["id", "question_id", "titre", "categorie", "sensibilite", "statut", "force", "format_recommande", "export", "fichier", "uri", "hash_document", "systeme_source", "proprietaire", "date_observation", "date_expiration", "perimetre", "validateur", "resultat_controle", "version", "historique"],
  evidenceOut.map((e) => [e.id, e.questionId, e.title, e.category, e.sensitivity, e.status, e.strength, e.recommendedFormat,
    e.sensitivity === "public" || e.sensitivity === "internal" ? "exportable" : "reserve",
    e.fileName, e.fileUri, e.documentHash, e.sourceSystem, e.owner, e.observedAt, e.expiresAt, e.coveredScope, e.validator, e.controlResult, e.version, e.history]),
), "evidence_register", "Registre des preuves : sensibilite, statut, force, source et empreinte.");

write(`plan-remediation-${slug}.csv`, csv(
  ["id", "question_id", "constats", "severite", "raison", "action_recommandee", "livrable_attendu", "echeance"],
  debts.map((d) => [d.id, d.questionId, d.findingIds, d.severity, d.reason, d.recommendedAction, d.deliverable, d.dueDate]),
), "proofdebt_plan", "Plan de corrections classe par gravite, avec echeances.");

write(`rapport-audit-${slug}.md`, data.reportMd(pack), "supplier_answer", "Rapport detaille : reponses, constats, preuves.");
write(`note-synthese-${slug}.md`, data.summaryMd(pack), "executive_summary", "Synthese de l'audit en une page.");

// Le manifeste inventorie aussi le questionnaire et les annexes.
const extra = [qFile, ...fs.readdirSync(path.join(out, "annexes")).sort().map((f) => `annexes/${f}`)];
const manifest = {
  id: `proofpack_bundle_${slug}_${stamp}`,
  title: `ProofPack - ${caseInfo.title}`,
  caseId,
  auditedCommit: commit,
  generatedAt: now,
  files: [
    ...Object.entries(files).map(([name, f]) => ({ path: name, role: f.role, description: f.description, size: f.bytes.length, sha256: sha(f.bytes) })),
    ...extra.map((rel) => {
      const b = fs.readFileSync(path.join(out, rel));
      return { path: rel, role: rel === qFile ? "source_questionnaire" : "annex", description: rel === qFile ? "Questionnaire source." : "Annexe brute (sortie d'outil ou releve).", size: b.length, sha256: sha(b) };
    }),
  ],
  verification: { page: "https://blackproof.fr/verify", schema: "https://blackproof.fr/schemas/proofpack/v3.schema.json", fingerprint: pack.fingerprint },
  limits: ["Auto-evaluation assistee", "Pas une certification", "Pas un audit officiel", "Aucun test d'intrusion actif"],
};
fs.writeFileSync(path.join(out, "proofpack-bundle-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

console.log("empreinte", pack.fingerprint);
console.log(JSON.stringify(summary));
