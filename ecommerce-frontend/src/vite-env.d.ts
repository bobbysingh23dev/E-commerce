/// <reference types="vite/client" />

// Teach TypeScript about our custom env var, so `import.meta.env.VITE_GEMINI_API_KEY`
// is a typed string instead of `any`. Only VITE_-prefixed vars are exposed to
// the browser by Vite.
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  // Backend API base URL. Optional: unset in local dev (falls back to :4000),
  // set on Vercel to the deployed Render URL.
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
