# Handoff Report: Official Documentation Integration

## 1. Observation
- Checked the existing student workspace layouts:
  - `app/learn/[course]/[chapter]/ChapterClient.tsx` (lines 318-415) defines the desktop grid layout: `grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]` dividing the page into a left instruction column and a right workspace column. It also defines mobile tabs `lesson`, `editor`, and `output` at lines 294-315.
  - `components/lesson/ChapterWorkspace.tsx` renders the code workspace, containing `MonacoEditor` (taking 55% height at line 170) and a bottom output area (live HTML preview iframe or JS execution logs at lines 223-264).
- Identified user rules: The Light Theme (Mint Green/White/Grey) must be prioritized for design proposals.
- Reviewed security standards: Official documentation sources (e.g. MDN) block standard framing using `X-Frame-Options: DENY` headers.

## 2. Logic Chain
- Since the desktop workspace layout currently divides the screen into a 2-column grid (`ChapterClient.tsx`), we can insert a third collapsible column (width ~25%) on the right to display integrated documentation without breaking the existing workflow.
- On mobile devices, since horizontal space is scarce, adding columns is not viable; therefore, a pull-up bottom sheet drawer is the most appropriate layout choice, overlaying the editor when triggered by a dedicated Docs button.
- Due to strict browser security policies (`X-Frame-Options` and `CSP`), direct embedding of external documentation pages (Option 1: iFrame Direct) is impossible without violating standard security rules.
- While Option 2 (API Aggregation) bypasses browser CORS via server-side proxies, it introduces network dependencies and potential rate-limiting.
- Therefore, Option 3 (Local Caching & Bundling) is the most robust implementation choice, as it operates 100% offline, guarantees fast rendering, avoids CORS/CSP issues entirely, and allows strict visual styling that matches the preferred Light Theme.

## 3. Caveats
- The precise data format of the raw DevDocs/MDN archives was not inspected locally.
- The build size impact of storing the static documentations in the project workspace was not measured, though standard HTML/CSS/JS text files can be compressed significantly.

## 4. Conclusion
Integrating official documentation should be achieved via a 3-column layout on desktop and a pull-up drawer on mobile. Technically, Option 3 (Local Caching & Bundling with Next.js static asset routes) is the only viable approach that guarantees both security (no CSP issues) and a cohesive UI using the user's preferred Mint Green/White/Grey theme.

## 5. Verification Method
- Inspect `c:\Users\joan7\Desktop\projet fil rouge\codeforge\.agents\explorer_m23_3\analysis.md` to review the detailed designs and comparative analysis.
- Check the structure of `app/learn/[course]/[chapter]/ChapterClient.tsx` and `components/lesson/ChapterWorkspace.tsx` to verify grid alignment and tab layouts.
