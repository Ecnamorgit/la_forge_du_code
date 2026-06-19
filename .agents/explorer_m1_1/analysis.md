# Legal Compliance & iFrame Compatibility Analysis (14 Technology Domains)

## Executive Summary
Integrating official documentation for the 14 technology domains via direct `<iframe>` is technically impossible due to strict clickjacking prevention headers (`X-Frame-Options` and CSP `frame-ancestors`). A hybrid strategy of **Local Caching & Scraping** for open-license documentations (e.g., Node.js JSON, Python HTML, React/TypeScript/Docker repos) and **API Aggregation** (e.g., DevDocs.io API) for proprietary/restrictive documentations (e.g., MongoDB, Oracle MySQL) is recommended to ensure offline availability and legal compliance.

---

## 1. Legal Compliance Matrix

| Domain | Official Documentation Source | License / Copyright | Can iFrame? | iFrame Blocking Mechanism | Proposed Legal & Technical Integration Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **HTML** | [MDN Web Docs](https://developer.mozilla.org) | CC-BY-SA 2.5 or later (Mozilla) | **No** | `X-Frame-Options: DENY`<br>CSP `frame-ancestors 'self'` | **Local Caching / DevDocs API**: Clone source from MDN Content GitHub repository, parse markdown, host locally (attribution required under CC-BY-SA). |
| **CSS** | [MDN Web Docs](https://developer.mozilla.org) | CC-BY-SA 2.5 or later (Mozilla) | **No** | `X-Frame-Options: DENY`<br>CSP `frame-ancestors 'self'` | **Local Caching / DevDocs API**: Similar to HTML. Extract and host MDN CSS references locally with appropriate attribution. |
| **JS** | [MDN Web Docs](https://developer.mozilla.org) & [TC39](https://tc39.es) | CC-BY-SA 2.5+ (MDN); Proprietary Copyright (TC39) | **No** | `X-Frame-Options: DENY`<br>CSP `frame-ancestors 'none'` | **DevDocs API / Local MDN Cache**: Use MDN-sourced JavaScript documentation cache. Avoid redistribution of raw TC39 ECMAScript specification text. |
| **React** | [React Docs](https://react.dev) | CC-BY-4.0 (Meta Open Source); Code: CC0 | **No** | `X-Frame-Options: DENY`<br>CSP `frame-ancestors 'none'` | **Local Re-hosting / DevDocs**: React docs are open-source on GitHub (`reactjs/react.dev`). Clone, build static pages, and host locally. Attribute Meta Open Source. |
| **TS** | [TypeScript Handbook](https://www.typescriptlang.org) | Apache License 2.0 (Microsoft) | **No** | `X-Frame-Options: DENY`<br>CSP restrictions | **Local Re-hosting / DevDocs**: Download and build TypeScript handbook pages from the `microsoft/TypeScript-Website` repository. Respect Apache 2.0 copyright notices. |
| **Git** | [Git Reference](https://git-scm.com) | CC-BY-3.0 (Git project) | **No** | `X-Frame-Options: SAMEORIGIN` | **Local Parsing / DevDocs**: Parse Git man pages from the Git source repository or host git-scm html pages locally. Respect CC-BY-3.0 attribution. |
| **SQL** | [PostgreSQL Docs](https://www.postgresql.org/docs) & [MySQL Docs](https://dev.mysql.com/doc) | PostgreSQL License (Permissive); Oracle Proprietary (MySQL) | **No** | `X-Frame-Options: SAMEORIGIN` / CSP restrictions | **Hybrid**: Host PostgreSQL docs locally (permissive license). Link MySQL docs externally, or use DevDocs API to avoid copyright infringement of Oracle proprietary manuals. |
| **Node** | [Node.js API Docs](https://nodejs.org/api) | MIT License / CC-BY-4.0 | **No** | `X-Frame-Options: SAMEORIGIN`<br>CSP restrictions | **API JSON Caching**: Download `https://nodejs.org/api/all.json` at build time, cache locally, and render natively in the CodeForge workspace UI. |
| **Tests** | [Jest](https://jestjs.io) & [Mocha](https://mochajs.org) | CC-BY-4.0 & MIT (Jest); CC-BY-4.0 & MIT (Mocha) | **No** | `X-Frame-Options: DENY` (Vercel/Netlify hosting headers) | **Local Caching / DevDocs**: Clone Jest/Mocha markdown docs from GitHub repositories, compile, and host locally. Respect CC-BY-4.0. |
| **DevOps**| [Docker Docs](https://docs.docker.com) & [Kubernetes](https://kubernetes.io) | Apache 2.0 & CC-BY-SA 4.0 (Docker); CC-BY-4.0 (K8s) | **No** | `X-Frame-Options: DENY`<br>CSP `frame-ancestors 'none'` | **Local Caching**: Clone documentation repositories, build, and serve locally. Respect CC-BY-SA-4.0 ShareAlike terms for Docker. |
| **MongoDB**| [MongoDB Manual](https://www.mongodb.com/docs/manual) | Proprietary Copyright (MongoDB Inc.) | **No** | `X-Frame-Options: SAMEORIGIN`<br>CSP `frame-ancestors 'none'` | **API Aggregation**: Query the DevDocs.io API or direct users to external links. Proprietary licensing strictly prohibits wholesale scraping and hosting of MongoDB docs. |
| **Sécurité**| [OWASP](https://owasp.org) | CC-BY-SA 4.0 | **No** | `X-Frame-Options: DENY` | **Local Markdown Rendering**: Fetch official OWASP Cheat Sheets and Top 10 repositories from GitHub, compile markdown, and host locally. |
| **Python**| [Python Docs](https://docs.python.org) | PSF License (Permissive) | **No** | CSP `frame-ancestors 'none'` | **Local Archive Hosting**: Download official offline HTML/JSON documentation archives directly from Python, host locally. |
| **Algo** | [Wikipedia](https://wikipedia.org) & [Rosetta Code](https://rosettacode.org) | CC-BY-SA 4.0 / GFDL | **No** | `X-Frame-Options: SAMEORIGIN` / `DENY` | **Curated Cheat Sheets**: Write original algorithm cheat sheets, or integrate Rosetta Code snippets / Wikipedia summaries with CC-BY-SA 4.0 credits. |

---

## 2. Detailed Technical & Legal Analysis

### 2.1 Why Direct iFrames Are Infeasible
Almost all modern technical documentation providers have implemented protections against **clickjacking** (where an attacker embeds a site in an iframe to trick users into clicking links).
- **`X-Frame-Options: DENY` / `SAMEORIGIN`**: Instructs browsers to reject rendering the page in an iframe unless it originates from the same domain.
- **CSP `frame-ancestors`**: A modern and robust security directive in the `Content-Security-Policy` header. Setting it to `'none'` or `'self'` prevents external domains from embedding the site.
- **Result**: Attempts to load these sites directly in CodeForge will fail with browser errors (e.g., `Refused to display '...' in a frame because it set 'X-Frame-Options' to 'sameorigin'`).

### 2.2 License Compliance Analysis
- **Permissive Open Source (MIT, Apache 2.0, PSF)**: Allows full redistribution, modification, and re-hosting of the docs. This applies to TypeScript, Python, Node.js. Integration is simple and requires only preserving the copyright notice and license.
- **Creative Commons (CC-BY-4.0, CC-BY-3.0)**: Allows redistribution and modification, even commercially, as long as appropriate credit is given. This applies to React, Kubernetes, and Git.
- **Creative Commons ShareAlike (CC-BY-SA 2.5 / 4.0)**: Allows redistribution, but any modifications must be published under the same CC-BY-SA license. This applies to MDN (HTML/CSS/JS), Docker, OWASP, and Wikipedia. If CodeForge modifies these docs, the modified docs must be copylefted.
- **Proprietary Copyrights**: MongoDB and MySQL (Oracle) documents are copyrighted and lack permissive open-source licenses for wholesale redistribution. Re-hosting these documents locally presents legal risks of copyright infringement.

---

## 3. Comparative Integration Strategies

### Option A: Direct iFrame
- **Description**: Embedding `<iframe src="https://..." />` directly in the IDE.
- **Pros**: None, as it is blocked by security headers.
- **Cons**: Broken user experience (blank screen, browser security errors).
- **Legal Risk**: None, but technically non-viable.

### Option B: API Aggregation (e.g., DevDocs.io)
- **Description**: Fetch documentation pages on demand via a documentation aggregator like DevDocs.io.
- **Pros**: Standardized formatting, unified API, covers almost all 14 domains, clean CSS.
- **Cons**: Requires internet access at runtime (violating offline/sandbox goals), relies on external service availability.
- **Legal Risk**: Low (uses fair use and complies with source licenses), but requires downstream attribution.

### Option C: Local Caching & Scraping (Recommended)
- **Description**: Download or build documentation assets (Markdown, JSON, HTML) at build time, compile them into static assets, and serve them locally from CodeForge servers.
- **Pros**: 100% offline support, super-fast loading, fully customizable CSS matching CodeForge's theme, absolute control.
- **Cons**: Requires initial setup, storage space, and a maintenance process to update docs.
- **Legal Risk**: Medium. Extremely safe for MIT/Apache/CC-BY, but requires careful attribution for CC-BY-SA, and we must avoid local hosting of proprietary MongoDB and MySQL documentation (these should use DevDocs API or external links).

---

## 4. Proposed Hybrid Implementation Strategy

To maximize performance, design consistency, and legal compliance, CodeForge should adopt a **hybrid documentation pipeline**:

1. **Local Native Renderer (MIT / Apache / CC-BY)**:
   - **Node.js**: Fetch `all.json` at build time, parse it, and render native React components.
   - **React, TS, Python, DevOps (Kubernetes)**: Download markdown files from their public GitHub repositories, run a static site generator (e.g., Nextra or custom markdown renderer) and host them on a local origin (`/docs/react`, `/docs/ts`).
2. **Local Static Mirrors (CC-BY-SA)**:
   - **HTML, CSS, JS (MDN)**: Fetch parsed MDN content, host it locally with a clear attribution footer: *"Portions of this content are © 1998–2026 by individual mozilla.org contributors; content available under CC-BY-SA 2.5."*
3. **External Fallback / Proxy (Proprietary Docs)**:
   - **MongoDB & MySQL**: Display curated cheat sheets (written by CodeForge) inside the IDE workspace. Provide external links (`target="_blank"`) for deep-dive official references, or fetch specific endpoints from a DevDocs proxy to avoid direct copyright reproduction.
