"use client";

import dynamic from "next/dynamic";

// Self-héberge Monaco depuis /public/monaco au lieu du CDN jsdelivr (CF-16).
// On configure le loader au moment où le module se charge côté client, avant
// que l'éditeur ne soit monté.
const Editor = dynamic(
  () =>
    import("@monaco-editor/react").then((mod) => {
      mod.loader.config({ paths: { vs: "/monaco/vs" } });
      return mod.default;
    }),
  { ssr: false }
);

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  language?: "html" | "javascript" | "sql";
}

export default function MonacoEditor({
  value,
  onChange,
  placeholder,
  language = "html",
}: MonacoEditorProps) {
  return (
    <div className="flex-1 min-h-0 relative crt-overlay crt-flicker">
      {!value && placeholder && (
        <div className="absolute top-3.5 left-16 text-nebula-text-dim text-sm font-code pointer-events-none z-20 italic opacity-60">
          {placeholder}
        </div>
      )}
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        theme="nebula-dark"
        beforeMount={(monaco) => {
          monaco.editor.defineTheme("nebula-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
              { token: "tag", foreground: "3D7EFF" },
              { token: "attribute.name", foreground: "00F0FF" },
              { token: "attribute.value", foreground: "00FF88" },
              { token: "delimiter", foreground: "FF6B2C" },
              { token: "comment", foreground: "2A3A55", fontStyle: "italic" },
              { token: "keyword", foreground: "FF6B2C" },
              { token: "string", foreground: "00FF88" },
            ],
            colors: {
              "editor.background": "#050A14B8",
              "editor.foreground": "#C8D6E5",
              "editor.lineHighlightBackground": "#0C122066",
              "editor.selectionBackground": "rgba(0,240,255,0.12)",
              "editorCursor.foreground": "#00F0FF",
              "editorLineNumber.foreground": "#2A3A55",
              "editorLineNumber.activeForeground": "#6B7D99",
              "editor.selectionHighlightBackground": "rgba(0,240,255,0.06)",
              "editorGutter.background": "#050A14B8",
              "editorWidget.background": "#0A1628CC",
              "editorWidget.border": "#1A2744CC",
            },
          });
        }}
        options={{
          fontSize: 15,
          fontFamily: "'JetBrains Mono', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          renderLineHighlight: "line",
          tabSize: 2,
          automaticLayout: true,
          wordWrap: "on",
          padding: { top: 14 },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          scrollbar: {
            verticalScrollbarSize: 5,
            horizontalScrollbarSize: 5,
          },
        }}
      />
    </div>
  );
}
