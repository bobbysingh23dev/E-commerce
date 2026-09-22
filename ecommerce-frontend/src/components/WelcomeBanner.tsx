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
      className="mb-6 flex items-start gap-3 rounded-xl border border-indigo-100 bg-linear-to-r from-indigo-50 via-purple-50 to-pink-50 p-4 shadow-sm"
    >
      <span className="text-xl leading-none" aria-hidden>
        ✨
      </span>

      <p className="flex-1 text-sm leading-relaxed text-slate-700">
        {welcomeMessage}
      </p>

      <button
        type="button"
        onClick={dismissWelcome}
        aria-label="Dismiss welcome message"
        className="text-slate-400 transition-colors hover:text-slate-700"
      >
        ✕
      </button>
    </div>
  );
}
