/// <reference types="vite/client" />

/**
 * Original prose content files, rendered via `<analog-markdown>` (see
 * src/content/docs). Named `.txt` (not `.md`) so Vite's raw-import query
 * resolves them as plain text instead of Analog's content-file transform,
 * which unconditionally intercepts `.md` imports for its own route-content
 * pipeline (see AnalogMarkdownRouteComponent/injectContent).
 */
declare module '*.txt?raw' {
  const content: string;
  export default content;
}
