# Handoff Report — 2026-06-18T15:14:41+02:00

## 1. Observation
We investigated the CodeForge codebase to understand the current workspace layout and editor setup:
- **Files identified**:
  - `c:\Users\joan7\Desktop\projet fil rouge\codeforge\components\lesson\ChapterWorkspace.tsx`
  - `c:\Users\joan7\Desktop\projet fil rouge\codeforge\app\learn\[course]\[chapter]\ChapterClient.tsx`
- **Layout details from `ChapterClient.tsx`**:
  - On lines 318-320, we observed a 2-column grid layout for desktop screens:
    ```tsx
    <div className="relative z-[1] grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* LEFT — lesson */}
      <main ... className={`... ${mobileTab === "lesson" ? "block" : "hidden lg:block"}`}>
    ```
  - On line 399, the workspace is mounted in the right column:
    ```tsx
    {/* RIGHT — workspace */}
    <div className={`min-h-0 ${mobileTab === "lesson" ? "hidden lg:flex" : "flex"} flex-col`}>
      <ChapterWorkspace ... />
    ```
- **Workspace components in `ChapterWorkspace.tsx`**:
  - On line 170-174, the Monaco Editor is rendered in the top half of the workspace (55% height):
    ```tsx
    <div className={`min-h-0 flex-col lg:flex lg:h-[55%] lg:flex-none ${mobilePanel === "output" ? "hidden" : "flex flex-1"}`}>
      <MonacoEditor ... />
    ```
  - On line 256, an iframe preview is rendered in the bottom half of the workspace (HTML courses):
    ```tsx
    <iframe ref={iframeRef} className={`flex-1 min-h-0 border-none bg-white ${mobilePanel === "editor" ? "hidden lg:block" : "block"}`} ... />
    ```

## 2. Logic Chain
- **Requirement**: Design UX/UI layouts for integrating official documentation beside the Monaco editor, and analyze technical feasibility (iFrame, API, Caching).
- **UX Layout Logic**:
  - Since the desktop screen is split into a 2-column grid (Lesson vs Workspace), introducing documentation beside Monaco can be solved by splitting the workspace (Right Column) into a Code/Preview section and a Doc panel section, or upgrading to a 3-column layout (Lesson, Workspace, Doc Panel).
  - The collapsible 3-column split-workspace panel allows side-by-side reading and writing of code without losing the narrative instruction context on the left.
  - On mobile, tabs are already used (`lesson`, `editor`, `output`). Adding another full tab makes visual reference impossible. Therefore, a context-aware modal bottom sheet sliding up over the editor is the optimal approach to preserve code/cursor context.
- **Technical Feasibility Logic**:
  - Directly embedding external documentation websites (MDN or DevDocs) inside an `<iframe>` will fail due to security policies (like `X-Frame-Options: SAMEORIGIN` or strict CSP headers enforced by MDN).
  - Bypassing iframe limitations requires a server-side fetching mechanism (API Aggregation) to retrieve documentation data, sanitize it, and render it in React components.
  - Local caching/bundling of doc datasets yields the highest performance (sub-millisecond latency) and works offline, which is critical for classroom environments.

## 3. Caveats
- No performance benchmarking was done on database sizes of documentation datasets. A full MDN dump could exceed 100MB, which might bloat the project if bundled statically in SQLite or Postgres. A scoped subset of the documentation is recommended.
- The actual API rate limits for DevDocs.io were not tested, as we did not perform active outbound requests due to the `CODE_ONLY` network restriction.

## 4. Conclusion
We completed the integration designs (Desktop Split Panel and Mobile Overlay) and technical feasibility report. We recommend a **Hybrid Local Caching & API Aggregation Architecture** using native React rendering. This guarantees visual consistency, custom code snippets with "Try in Editor" buttons, and zero iframe security blockages. All findings, designs, and comparison matrices have been documented in `analysis.md`.

## 5. Verification Method
1. Inspect the completed design report at:
   `c:\Users\joan7\Desktop\projet fil rouge\codeforge\.agents\explorer_m23_1\analysis.md`
2. Confirm that the Mermaid diagrams successfully render when viewed using a markdown viewer or GitHub preview.
3. Verify that the comparative matrix contains all 3 requested options (iFrame, API, Cache) and addresses security, offline capability, and editor integration.
