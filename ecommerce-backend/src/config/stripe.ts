import Stripe from "stripe";

// Build the Stripe client LAZILY — only the first time a payment needs it,
// not at startup. Why: `new Stripe(undefined)` throws, so constructing it at
// import time would crash the WHOLE app on boot whenever STRIPE_SECRET_KEY is
// missing (even for routes that never touch payments — like /health). With
// lazy init the app boots fine; only an actual payment call fails if the key
// isn't configured, and it fails with a clear message.
let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set — payments are unavailable until it is configured.",
      );
    }
    client = new Stripe(key);
  }
  return client;
}
