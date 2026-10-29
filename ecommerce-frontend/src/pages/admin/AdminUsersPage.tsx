import { useEffect, useState, type FormEvent } from "react";
import { getUsers, createStaffUser, updateUserRole } from "../../api/users";
import { USER_ROLES, type AdminUser, type UserRole } from "../../types";
import { ApiError } from "../../api/client";
import AdminNav from "../../components/AdminNav";
import TextField from "../../components/TextField";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const selectClass =
  "w-full rounded-lg border border-line bg-transparent px-3 py-2 text-sm disabled:opacity-50";

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // "Add staff" form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("support");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => setError(err.message ?? "Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await createStaffUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      setUsers((prev) => [...prev, created]);
      toast(`Created ${created.name} as ${created.role}`, "success");
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create user");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRoleChange(target: AdminUser, next: UserRole) {
    if (next === target.role) return;
    setError(null);
    try {
      const updated = await updateUserRole(target.id, next);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast(`${updated.name} is now ${updated.role}`, "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change role");
    }
  }

  return (
    <div>
      <AdminNav />
      <h1 className="mb-1 text-2xl font-bold">Manage users</h1>
      <p className="mb-5 text-sm text-muted">
        A role change applies the next time that user logs in.
      </p>

      {error && <div className="alert-error mb-4">{error}</div>}

      <form onSubmit={handleCreate} className="card mb-6 max-w-lg space-y-3 p-5">
        <p className="text-sm font-semibold text-muted">Add a staff member</p>
        <TextField label="Name" value={name} onChange={setName} required />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          autoComplete="off"
        />
        <TextField
          label="Temporary password"
          type="password"
          value={password}
          onChange={setPassword}
          required
          minLength={6}
          autoComplete="new-password"
        />
        <label className="block">
          <span className="label">Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className={selectClass}
          >
            {USER_ROLES.map((r) => (
              <option key={r} value={r} className="text-black">
                {r}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Creating…" : "Create user"}
        </button>
      </form>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="card divide-y divide-line">
          {users.map((u) => {
            const isMe = u.id === me?.id;
            return (
              <div key={u.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold text-fg">
                    {u.name} {isMe && <span className="text-faint">(you)</span>}
                  </p>
                  <p className="text-sm text-muted">{u.email}</p>
                </div>
                <select
                  value={u.role}
                  disabled={isMe}
                  title={isMe ? "You can't change your own role" : undefined}
                  onChange={(e) =>
                    handleRoleChange(u, e.target.value as UserRole)
                  }
                  className="w-auto rounded-lg border border-line bg-transparent px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  {USER_ROLES.map((r) => (
                    <option key={r} value={r} className="text-black">
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
