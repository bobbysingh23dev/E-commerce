/// <reference types="vite/client" />

// Teach TypeScript about our custom env var, so `import.meta.env.VITE_GEMINI_API_KEY`
// is a typed string instead of `any`. Only VITE_-prefixed vars are exposed to
// the browser by Vite.
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
