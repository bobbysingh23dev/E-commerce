import { useAuth } from "../context/AuthContext";

// Shows the AI-generated welcome message right after login. It reads straight
// from the auth context, so it appears the moment Gemini's reply lands and
// disappears on dismiss or logout. Renders nothing when there's no message.
export default function WelcomeBanner() {
  const { welcomeMessage, dismissWelcome } = useAuth();

  if (!welcomeMessage) return null;

  return (
    <div
      role="status"
      className="mb-8 flex items-start gap-3 rounded-2xl border border-accent/30 bg-linear-to-r from-accent/10 via-accent-2/10 to-transparent p-4 shadow-[0_10px_40px_-16px_rgba(139,92,246,0.6)]"
    >
      <span className="text-xl leading-none" aria-hidden>
        ✨
      </span>

      <p className="flex-1 text-sm leading-relaxed text-fg">{welcomeMessage}</p>

      <button
        type="button"
        onClick={dismissWelcome}
        aria-label="Dismiss welcome message"
        className="link-muted"
      >
        ✕
      </button>
    </div>
  );
}
