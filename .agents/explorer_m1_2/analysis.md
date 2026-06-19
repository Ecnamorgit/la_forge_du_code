# Legal Compliance & Integration Analysis — CodeForge Reference Documentation

This document evaluates the legal constraints and technical feasibility of integrating official documentation for the **14 core domains** of CodeForge: **HTML, CSS, JS, React, TS, Git, SQL, Node, Tests, DevOps, MongoDB, Sécurité, Python, and Algo**.

---

## 1. Executive Summary

- **The iFrame Illusion**: Direct `<iframe>` integration is **technically impossible** for 12 out of 14 domains because official websites use strict security headers (`X-Frame-Options: DENY/SAMEORIGIN` or `Content-Security-Policy: frame-ancestors`).
- **Legal Pitfalls (NonCommercial & Proprietary)**:
  - **Git**: The *Pro Git* book is licensed under **CC BY-NC-SA 3.0** (Non-Commercial). Local replication within CodeForge represents a legal risk if CodeForge is commercialized.
  - **MongoDB**: Official documentation is under **CC BY-NC-SA 3.0**. Copying/hosting it locally is prohibited for commercial use.
  - **Algorithms**: Proprietary sites like *GeeksforGeeks* forbid scraping or reproduction.
- **Recommended Strategy**: Use a **Local Caching / DevDocs API Integration** for permissive licenses (MIT, Apache 2.0, CC BY, PSFL) and fallback to **Direct External Hyperlinks** for proprietary/non-commercial restricted materials.

---

## 2. Legal Compliance Matrix

| Technology | Official Source | Primary Content License | Can iFrame? | Proposed Legal Integration Strategy |
| :--- | :--- | :--- | :---: | :--- |
| **HTML** | WHATWG / MDN Web Docs | WHATWG: CC BY 4.0<br>MDN: CC BY-SA 2.5+ | **No** | **Local Caching / DevDocs API**:<br>Permissive CC BY/CC BY-SA allows local rendering of parsed HTML. Must include creator attribution and license links. |
| **CSS** | W3C / MDN Web Docs | W3C: W3C Doc License<br>MDN: CC BY-SA 2.5+ | **No** | **Local Caching / DevDocs API**:<br>Same as HTML. Render parsed MDN content locally. W3C specifications should be referenced via direct external links. |
| **JS** | TC39 (Ecma) / MDN Web Docs | TC39: BSD-like / permissive<br>MDN: CC BY-SA 2.5+ | **No** | **Local Caching / DevDocs API**:<br>Parse MDN JS pages and display them in the app. TC39 drafts can be linked directly. |
| **React** | React Team (react.dev) | CC BY 4.0 | **No** | **Local Caching**:<br>Download and cache official docs. CC BY 4.0 allows commercial redistribution with attribution. |
| **TS** | Microsoft (typescriptlang.org) | Apache 2.0 | **No** | **Local Caching / DevDocs API**:<br>Since documentation is Apache 2.0, we can host a local parsed copy. Must include Apache 2.0 license notice. |
| **Git** | Git Project (git-scm.com) | Book: CC BY-NC-SA 3.0<br>Man pages: GPLv2 | **No** | **Hybrid**:<br>1. *Local Caching* of the GPLv2 manual pages.<br>2. *Direct Hyperlinks* to git-scm.com/book to bypass the CC BY-NC-SA Non-Commercial clause. |
| **SQL** | PostgreSQL / SQLite / MySQL | Postgres: PostgreSQL License<br>SQLite: Public Domain<br>MySQL: Oracle GPL/Proprietary | **No** / **Partial** | **Local Caching** (Postgres/SQLite) + **Direct Links** (MySQL):<br>Host Postgres and SQLite docs locally. For MySQL, provide direct links to avoid Oracle copyright disputes. |
| **Node** | OpenJS Foundation (nodejs.org) | CC BY 4.0 | **No** | **Local Caching**:<br>Extract official JSON documentation builds from Node.js releases and render them locally. CC BY 4.0 compliant with attribution. |
| **Tests** | Jest / Vitest / Mocha | Jest: CC BY 4.0<br>Vitest: MIT / CC BY 4.0 | **No** | **Local Caching**:<br>Highly permissive licenses permit direct download, caching, and styling of documentation pages inside the application. |
| **DevOps** | Docker / Kubernetes | Docker: Apache 2.0<br>Kubernetes: CC BY 4.0 | **No** | **Local Caching / DevDocs API**:<br>Cache markdown documentation locally. Respect Docker's trademarks (explicitly state CodeForge is unaffiliated). |
| **MongoDB** | MongoDB Inc. (mongodb.com/docs) | CC BY-NC-SA 3.0 | **No** | **Direct Links / Custom Synthesis**:<br>Do not copy or cache MongoDB docs locally due to CC Non-Commercial constraint. Write custom syntax sheets or link out. |
| **Sécurité** | OWASP / ANSSI | OWASP: CC BY-SA 4.0<br>ANSSI: Licence Ouverte v2.0 | **No** | **Local Caching / Rendering**:<br>ANSSI Licence Ouverte and OWASP CC BY-SA allow local hosting and formatting with proper attribution. |
| **Python** | Python Software Foundation | PSFL v2 (Permissive) | **Partial** / **No** | **Local Caching / DevDocs API**:<br>PSFL allows redistribution and copying. Download HTML/JSON builds of Python docs and render them inside the app. |
| **Algo** | Wikipedia / GeeksforGeeks | Wikipedia: CC BY-SA 4.0<br>GeeksforGeeks: Proprietary | **No** / **Partial** | **Custom Curation + API**:<br>1. Write custom algorithmic explanations (MIT/Proprietary).<br>2. Integrate Wikipedia article segments via the Wikimedia API. Avoid GeeksforGeeks. |

---

## 3. In-Depth Legal Feasibility Analysis

### 3.1. The Creative Commons Attribution-ShareAlike (CC BY-SA) Framework
*Applicable to: HTML, CSS, JS, SQL (partial), Sécurité (OWASP), Algo (Wikipedia)*
- **Legal Compliance**: CC BY-SA requires that any derivatives or distributions also carry the same (or compatible) CC BY-SA license.
- **Integration Impact**: Since CodeForge is a software platform, displaying CC BY-SA documentation text inside a UI panel does *not* force the entire CodeForge application source code to become CC BY-SA (mere aggregation). However, the documentation files themselves must remain licensed under CC BY-SA with clear attribution and license links.

### 3.2. The Non-Commercial (NC) Clause Risk
*Applicable to: Git (Pro Git book), MongoDB*
- **Legal Compliance**: CC BY-NC-SA forbids using the material for commercial purposes.
- **Integration Impact**: If CodeForge is sold, has paid premium tiers, or is run by a commercial entity, locally caching, styling, or redistributing CC BY-NC-SA files is a direct copyright infringement.
- **Mitigation**: We must not store or copy MongoDB docs or the Pro Git book on CodeForge servers/clients. Instead, we must use direct external hyperlinks (which are legally safe as they do not duplicate copyrighted material) or draft custom, clean-room syntax cheatsheets under CodeForge ownership.

### 3.3. Permissive Open-Source Licenses
*Applicable to: React, TS, Node, Tests, DevOps, Python, SQL (PostgreSQL, SQLite)*
- **Legal Compliance**: MIT, Apache 2.0, PSFL v2, PostgreSQL License, and Public Domain (CC0) allow copying, distributing, and modifying the documentation text for both commercial and non-commercial purposes.
- **Integration Impact**: Completely safe for local hosting/caching.
- **Mitigation**: Standard legal requirement is only to preserve license text and copyright notices.

---

## 4. Technical Integration Strategies

### Option A: Direct iFrame (Discarded)
- **Feasibility**: Low. 90% of the sites block framing via headers:
  ```http
  X-Frame-Options: DENY
  Content-Security-Policy: frame-ancestors 'self'
  ```
- **Technical Risk**: If an iframe is forced, modern browsers render a blank page or security warning.

### Option B: API Aggregation (Recommended for Online Mode)
- **Feasibility**: High.
- **Implementation**: Fetch documentation chunks dynamically from APIs (e.g. Wikimedia API for Algo, DevDocs API JSON packages).
- **Technical Risk**: Requires active internet connection. Latency or rate-limiting from the third-party API.

### Option C: Caching & Local Hosting (Recommended for Offline-First)
- **Feasibility**: High.
- **Implementation**: Pre-compile static HTML/JSON files during the build process (e.g. download DevDocs.io static documentation repositories or extract MDN/Node JSON packages) and bundle them in the client app.
- **Technical Risk**: Increases application bundle size. Requires a maintenance script to periodically update documentation versions.

---

## 5. Architectural Recommendations

1. **Implement an Offline-First Doc Viewer**:
   - Use **Option C (Caching & Local Hosting)** for HTML, CSS, JS, React, TS, Node, Python, Postgres, SQLite, Jest/Vitest, DevOps, and OWASP/ANSSI.
   - Store documents as compressed JSON/Markdown files in the codebase (e.g. `public/docs/`).
   - Render them with a custom Markdown/HTML parser that applies CodeForge's Light/Dark theme styles.
2. **Handle Non-Commercial / Proprietary Content via Hyperlinks**:
   - For MongoDB, MySQL, and the Pro Git book, do not cache content. Use standard `<a>` tags targeting the official reference pages (opening in the user's default browser or in an external window).
3. **Write Custom Summaries for Algorithms**:
   - Avoid scraping GeeksforGeeks. Instead, write custom descriptions and code snippets for common data structures and algorithms (such as sorting, search, graphs) to avoid copyright issues.
