import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey || apiKey.startsWith("REPLACE_")) {
  console.warn(
    "[gemini] VITE_GEMINI_API_KEY is missing or still a placeholder. " +
      "Add a throwaway key to ecommerce-frontend/.env, then restart `npm run dev`.",
  );
}

export const gemini = new GoogleGenAI({ apiKey: apiKey ?? "" });

// Fallback chain: askGemini() tries these in order and moves to the next one
// whenever a model errors (503 overload, quota, etc.) or returns nothing.
// Ordered cheap/fast-first, with the verified-working gemini-3.5-flash up front.
// (gemini-2.5-* is intentionally left out — it 404s for newly-created keys.)
export const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-pro-latest",
  "gemma-4-31b-it",
  "gemma-4-26b-a4b-it",
];

// The primary model (first in the chain), kept as a named export for reference.
export const GEMINI_MODEL = GEMINI_MODELS[0];

/**
 * Send a prompt and get text back, trying each model in GEMINI_MODELS until one
 * succeeds. Throws only if EVERY model fails — with all the errors collected so
 * the failure is debuggable.
 */
export async function askGemini(prompt: string): Promise<string> {
  const failures: string[] = [];

  for (const model of GEMINI_MODELS) {
    try {
      const res = await gemini.models.generateContent({ model, contents: prompt });
      const text = res.text?.trim();
      if (text) return text; // got a real answer — done
      failures.push(`${model}: empty response`); // fall through to next model
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      failures.push(`${model}: ${msg}`);
      console.warn(`[gemini] "${model}" failed, trying next model →`, msg);
    }
  }

  throw new Error(`All Gemini models failed:\n${failures.join("\n")}`);
}
