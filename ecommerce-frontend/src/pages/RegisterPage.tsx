import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TextField from "../components/TextField";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-sm">
      <div className="card p-7 shadow-[0_30px_80px_-40px_rgba(139,92,246,0.5)]">
        <h1 className="text-2xl font-bold">
          Join <span className="gradient-text">Bobby&apos;s Shop</span>
        </h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Create an account — it takes ten seconds.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="alert-error">{error}</div>}

          <TextField
            label="Name"
            value={name}
            onChange={setName}
            required
            autoComplete="name"
          />
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
            minLength={6}
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-2.5"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-accent-3 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
