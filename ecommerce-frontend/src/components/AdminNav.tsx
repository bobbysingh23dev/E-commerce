import { NavLink } from "react-router-dom";

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
    isActive
      ? "bg-linear-to-br from-accent to-accent-2 text-white shadow-[0_6px_18px_-6px_rgba(124,92,246,0.8)]"
      : "text-muted hover:bg-white/5 hover:text-fg"
  }`;

export default function AdminNav() {
  return (
    <div className="mb-6 flex items-center gap-2 border-b border-line pb-4">
      <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-faint">
        Admin
      </span>
      <NavLink to="/admin/products" className={tabClass}>
        Products
      </NavLink>
      <NavLink to="/admin/categories" className={tabClass}>
        Categories
      </NavLink>
    </div>
  );
}
