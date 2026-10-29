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

const ROLE_INFO: Record<UserRole, { label: string; description: string }> = {
  customer: {
    label: "Customers",
    description: "Shop customers who can manage their account and place orders.",
  },
  admin: {
    label: "Admins",
    description: "Full access to the admin dashboard and user management.",
  },
  support: {
    label: "Support",
    description: "For staff who help customers with account and order questions.",
  },
  inventory_manager: {
    label: "Inventory",
    description: "For staff responsible for product stock and catalog availability.",
  },
  order_manager: {
    label: "Orders",
    description: "For staff who coordinate order processing and fulfillment.",
  },
  finance: {
    label: "Finance",
    description: "For staff who review payments, refunds, and sales figures.",
  },
  content_editor: {
    label: "Content",
    description: "For staff who maintain product and category information.",
  },
};

const roleTabClass = (active: boolean) =>
  `whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition ${
    active
      ? "bg-linear-to-br from-accent to-accent-2 text-white shadow-[0_6px_18px_-6px_rgba(124,92,246,0.8)]"
      : "text-muted hover:bg-white/5 hover:text-fg"
  }`;

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // "Add staff" form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("support");
  const [submitting, setSubmitting] = useState(false);

  const visibleUsers =
    selectedRole === "all"
      ? users
      : users.filter((user) => user.role === selectedRole);
  const selectedRoleInfo =
    selectedRole === "all" ? null : ROLE_INFO[selectedRole];

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

      <section className="card mb-6 p-4" aria-label="Filter users by role">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-semibold">Browse by role</h2>
            <p className="text-sm text-muted">
              Select a role to see its users and what the role is for.
            </p>
          </div>
          <span className="text-xs text-faint">{users.length} total users</span>
        </div>
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label="Filter by user role"
        >
          <button
            type="button"
            aria-pressed={selectedRole === "all"}
            className={roleTabClass(selectedRole === "all")}
            onClick={() => setSelectedRole("all")}
          >
            All users <span className="ml-1 opacity-75">{users.length}</span>
          </button>
          {USER_ROLES.map((roleOption) => {
            const count = users.filter((user) => user.role === roleOption).length;
            const active = selectedRole === roleOption;
            return (
              <button
                key={roleOption}
                type="button"
                aria-pressed={active}
                className={roleTabClass(active)}
                onClick={() => setSelectedRole(roleOption)}
              >
                {ROLE_INFO[roleOption].label}
                <span className="ml-1 opacity-75">{count}</span>
              </button>
            );
          })}
        </div>
        {selectedRoleInfo && (
          <p className="mt-3 border-t border-line pt-3 text-sm text-muted">
            <span className="font-semibold text-fg">{selectedRoleInfo.label}:</span>{" "}
            {selectedRoleInfo.description}
          </p>
        )}
      </section>

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
                {ROLE_INFO[r].label}
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
          {visibleUsers.map((u) => {
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
                      {ROLE_INFO[r].label}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
          {visibleUsers.length === 0 && !loading && (
            <p className="p-6 text-center text-sm text-muted">
              No users currently have this role.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
