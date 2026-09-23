import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AccountPage() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold">My account</h1>

      <div className="card p-6">
        {/* Gradient avatar with the user's initial */}
        <div className="mb-6 flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-accent to-accent-2 font-display text-2xl font-bold text-white shadow-[0_10px_30px_-8px_rgba(124,92,246,0.8)]">
            {user?.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-display text-lg font-bold">{user?.name}</p>
            {user?.role === "admin" && (
              <span className="chip mt-1 border-accent/40 text-accent-3">
                Admin
              </span>
            )}
          </div>
        </div>

        <dl className="divide-y divide-line rounded-xl border border-line bg-surface-2">
          <Row label="Email" value={user?.email} />
          <Row label="Role" value={user?.role} />
        </dl>

        <div className="mt-6 flex gap-3">
          <Link to="/orders" className="btn-primary">
            My orders
          </Link>
          <button onClick={logout} className="btn-ghost">
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between px-4 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-fg">{value}</dd>
    </div>
  );
}
