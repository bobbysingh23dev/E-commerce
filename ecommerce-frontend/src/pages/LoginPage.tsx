import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TextField from "../components/TextField";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-sm">
      <div className="card p-7 shadow-[0_30px_80px_-40px_rgba(139,92,246,0.5)]">
        <h1 className="text-2xl font-bold">
          Welcome <span className="gradient-text">back</span>
        </h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Log in to your account to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="alert-error">{error}</div>}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
            autoComplete="email"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            required
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-2.5"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-muted">
        No account?{" "}
        <Link to="/register" className="font-medium text-accent-3 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
