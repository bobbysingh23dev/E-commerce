import { loadStripe } from "@stripe/stripe-js";

const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!key || !key.startsWith("pk_")) {
  console.warn(
    "[stripe] VITE_STRIPE_PUBLISHABLE_KEY is missing or not a pk_ key. " +
      "Add it to ecommerce-frontend/.env and restart `npm run dev`.",
  );
}

// loadStripe returns a promise; create it ONCE at module scope (not per render)
// so Stripe.js isn't reloaded on every mount.
export const stripePromise = loadStripe(key ?? "");
