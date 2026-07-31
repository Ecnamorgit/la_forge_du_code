// Sonde CSP : si ce script s'execute dans une iframe srcdoc a origine opaque,
// c'est que `script-src 'self'` autorise bien un chargement depuis l'origine
// du parent. Utilisee par e2e/csp-srcdoc-script.spec.ts.
parent.postMessage({ type: "probe:ok" }, "*");
