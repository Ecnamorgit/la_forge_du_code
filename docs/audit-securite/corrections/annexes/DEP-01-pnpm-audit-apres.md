# pnpm audit --prod apres DEP-01 - 2026-09-12

Total : {"info":0,"low":6,"moderate":37,"high":14,"critical":0}

## dompurify

Chemins : .>monaco-editor>dompurify - version corrigee : >=3.3.2 - {"moderate":14,"low":4}

- moderate GHSA-v2wj-7wpq-c8vv DOMPurify contains a Cross-site Scripting vulnerability
- moderate GHSA-h7mw-gpvr-xq4m DOMPurify: FORBID_TAGS bypassed by function-based ADD_TAGS predicate (asymmetry with FORBID_ATTR fix)
- moderate GHSA-crv5-9vww-q3g8 DOMPurify has a SAFE_FOR_TEMPLATES bypass in RETURN_DOM mode
- moderate GHSA-v9jr-rg53-9pgp DOMPurify: Prototype Pollution to XSS Bypass via CUSTOM_ELEMENT_HANDLING Fallback
- moderate GHSA-hpcv-96wg-7vj8 DOMPurify: Cross-realm IN_PLACE sanitization leaves executable markup intact via realm-bound `instanceof` chec
- moderate GHSA-r47g-fvhr-h676 DOMPurify: IN_PLACE mode preserves attributes of a clobbered root element, allowing XSS via attacker-controlle
- moderate GHSA-rp9w-3fw7-7cwq DOMPurify IN_PLACE Sanitization Bypass via Attached Shadow Root Inside <template>.content
- low GHSA-c2j3-45gr-mqc4 DOMPurify: `CUSTOM_ELEMENT_HANDLING` bypasses `afterSanitizeElements` for allowed custom elements.
- moderate GHSA-cmwh-pvxp-8882 DOMPurify: Permanent `ALLOWED_ATTR` pollution via `setConfig()` bypassing the hook clone-guard (incomplete fix
- low GHSA-vxr8-fq34-vvx9 DOMPurify: Trusted Types policy survives `clearConfig()` and can poison later `RETURN_TRUSTED_TYPE` output
- low GHSA-gvmj-g25r-r7wr DOMPurify: SAFE_FOR_TEMPLATES bypass - template expressions survive sanitization inside <template> content whe
- low GHSA-x4vx-rjvf-j5p4 DOMPurify: `IN_PLACE` mode trusts attacker-controlled `nodeName` on live non-form nodes, allowing script reten
- moderate GHSA-76mc-f452-cxcm DOMPurify: Hook mutation of `data.allowedTags` / `data.allowedAttributes` permanently pollutes `DEFAULT_ALLOWE
- moderate GHSA-39q2-94rc-95cp DOMPurify's ADD_TAGS function form bypasses FORBID_TAGS due to short-circuit evaluation
- moderate GHSA-cjmm-f4jc-qw8r DOMPurify ADD_ATTR predicate skips URI validation
- moderate GHSA-cj63-jhhr-wcxv DOMPurify USE_PROFILES prototype pollution allows event handlers
- moderate GHSA-h8r8-wccr-v5f2 DOMPurify is vulnerable to mutation-XSS via Re-Contextualization 
- moderate GHSA-55q2-fjhq-7xh7 DOMPurify: IN_PLACE hook removal leaves a detached subtree executable, causing XSS

## @hono/node-server

Chemins : .>@prisma/client>prisma - version corrigee : >=1.19.13 - {"moderate":2}

- moderate GHSA-92pp-h63x-v22m @hono/node-server: Middleware bypass via repeated slashes in serveStatic
- moderate GHSA-frvp-7c67-39w9 Node.js Adapter for Hono: Path traversal in `serve-static` on Windows via encoded backslash (`%5C`)

## hono

Chemins : .>@prisma/client>prisma - version corrigee : >=4.12.21 - {"moderate":17,"high":1,"low":1}

- moderate GHSA-xrhx-7g5j-rcj5 Hono: IP Restriction bypasses static deny rules for non-canonical IPv6 
- moderate GHSA-3hrh-pfw6-9m5x Hono: Cookie helper does not sanitize sameSite and priority, allowing Set-Cookie injection
- moderate GHSA-f577-qrjj-4474 Hono: JWT middleware accepts any Authorization scheme, not only Bearer
- moderate GHSA-2gcr-mfcq-wcc3 Hono: app.mount() strips mount prefix using undecoded path, causing incorrect routing for percent-encoded path
- moderate GHSA-rv63-4mwf-qqc2 hono: Body Limit Middleware can be bypassed on AWS Lambda by understating `Content-Length`
- moderate GHSA-wgpf-jwqj-8h8p hono: Lambda@Edge adapter keeps only the last value of a repeated request header, dropping the rest
- high GHSA-88fw-hqm2-52qc hono: CORS Middleware reflects any Origin with credentials when `origin` defaults to the wildcard
- moderate GHSA-wwfh-h76j-fc44 hono: Path traversal in `serve-static` on Windows via encoded backslash (`%5C`)
- moderate GHSA-j6c9-x7qj-28xf hono: AWS Lambda adapter merges multiple `Set-Cookie` headers into one value, dropping cookies on ALB single-h
- moderate GHSA-xgm2-5f3f-mvvc Hono: API Gateway v1 adapter can drop a distinct repeated request header value during de-duplication
- moderate GHSA-hvrm-45r6-mjfj hono/jsx does not isolate context per request, leading to cross-request data disclosure
- moderate GHSA-w62v-xxxg-mg59 Hono: Server-Side XSS via JSX Escaping Bypass in cx() Utility
- moderate GHSA-8j4g-w8fx-2239 Hono: ReDoS in CORS middleware via Access-Control-Request-Headers
- moderate GHSA-f23p-vx2j-j53r Hono: `memo()` retains SSR output across requests, leading to cross-user data disclosure
- low GHSA-79qm-7rj5-m7r9 Hono: Proxy Helper does not remove response headers listed in the `Connection` header
- moderate GHSA-54fx-42gc-7vw4 Hono: Algorithmic Complexity DoS in Language Middleware
- moderate GHSA-gqvv-2mrq-wpjv Hono: Incomplete fix for CVE-2026-39408: `toSSG()` still writes files outside the output directory
- moderate GHSA-g6gw-c38x-mqfc Hono: Unbounded dot-notation nesting in `parseBody()` can cause memory exhaustion
- moderate GHSA-crvj-82cr-hjcx Hono: Query parser reads parameters after the URL fragment, causing cache-key and proxy interpretation differe

## brace-expansion

Chemins : .>@sentry/nextjs>@sentry/bundler-plugin-core - version corrigee : >=5.0.6 - {"moderate":1,"high":3}

- moderate GHSA-jxxr-4gwj-5jf2 brace-expansion: Large numeric range defeats documented `max` DoS protection
- high GHSA-3jxr-9vmj-r5cp brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups
- high GHSA-mh99-v99m-4gvg brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash
- high GHSA-rgw5-rvv9-x895 brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation

## @babel/core

Chemins : .>@sentry/nextjs>@sentry/bundler-plugin-core - version corrigee : >=7.29.6 - {"low":1}

- low GHSA-4x5r-pxfx-6jf8 @babel/core: Arbitrary File Read via sourceMappingURL Comment

## fast-uri

Chemins : .>@prisma/client>prisma - version corrigee : >=3.1.4 - {"high":6}

- high GHSA-v2hh-gcrm-f6hx fast-uri vulnerable to host confusion via literal backslash authority delimiter
- high GHSA-7p8r-x3mc-p8w7 fast-uri vulnerable to host confusion via backslash authority introducer
- high GHSA-f65p-4m7j-42xc fast-uri vulnerable to server-side request forgery via malformed IPv6 normalization
- high GHSA-fph4-wmhf-6fwf fast-uri vulnerable to server-side request forgery via repeated hostname percent-decoding
- high GHSA-jqff-g426-hqxp fast-uri vulnerable to host confusion via percent-encoded scheme normalization
- high GHSA-4c8g-83qw-93j6 fast-uri vulnerable to host confusion via failed IDN canonicalization

## valibot

Chemins : .>@prisma/client>prisma - version corrigee : >=1.4.2 - {"moderate":1}

- moderate GHSA-5qjj-4xww-7phc Valibot: record() issue paths can make flatten() throw for inherited Object property names

## deepmerge-ts

Chemins : .>@prisma/client>prisma - version corrigee : >=8.0.0 - {"high":1}

- high GHSA-ggr8-5vv4-36mx DeepmergeTS has stack exhaustion when merging recursive object graphs

## browserslist

Chemins : .>@sentry/nextjs>@sentry/bundler-plugin-core - version corrigee : >=4.28.7 - {"high":2}

- high GHSA-c83g-rgw3-j3cx Browserslist: Unbounded memory growth (no cache eviction) via distinct query results, leading to eventual OOM
- high GHSA-73wf-gq98-2v4g Browserslist: Uncaught crash / prototype write via untrusted browserslist-stats.json custom stats (normalizeSt

## mysql2

Chemins : .>@prisma/client>prisma - version corrigee : >=3.22.0 - {"high":1,"moderate":1}

- high GHSA-3f6p-5ww8-9rcr MySQL2: Auth Plugin Downgrade to mysql_clear_password Leaks Plaintext Credentials
- moderate GHSA-rgwj-5xj2-c3m3 MySQL2: Unbounded zlib inflate in compressed MySQL protocol handler allows decompression-bomb DoS

## baseline-browser-mapping

Chemins : .>@sentry/nextjs>@sentry/bundler-plugin-core - version corrigee : >=2.11.0 - {"moderate":1}

- moderate GHSA-w5vr-8v7q-w6rv baseline-browser-mapping process termination on invalid input causes denial of service
