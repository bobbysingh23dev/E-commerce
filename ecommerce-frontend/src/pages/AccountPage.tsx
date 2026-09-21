import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// This page is wrapped in <ProtectedRoute> in App.tsx, so if you reach it
// at all, `user` is guaranteed to be set.
export default function AccountPage() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">My account</h1>

      <dl className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        <div className="flex justify-between px-4 py-3">
          <dt className="text-slate-500">Name</dt>
          <dd className="font-medium text-slate-900">{user?.name}</dd>
        </div>
        <div className="flex justify-between px-4 py-3">
          <dt className="text-slate-500">Email</dt>
          <dd className="font-medium text-slate-900">{user?.email}</dd>
        </div>
        <div className="flex justify-between px-4 py-3">
          <dt className="text-slate-500">Role</dt>
          <dd className="font-medium text-slate-900">{user?.role}</dd>
        </div>
      </dl>

      <div className="mt-4 flex gap-3">
        <Link
          to="/orders"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          My orders
        </Link>
        <button
          onClick={logout}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
