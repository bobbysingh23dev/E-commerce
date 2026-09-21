import { NavLink } from "react-router-dom";

// NavLink is like Link, but it knows whether it's the active route and passes
// an `isActive` flag to a className function — handy for highlighting tabs.
const tabClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:bg-slate-100"
  }`;

export default function AdminNav() {
  return (
    <div className="mb-6 flex gap-2 border-b border-slate-200 pb-4">
      <NavLink to="/admin/products" className={tabClass}>
        Products
      </NavLink>
      <NavLink to="/admin/categories" className={tabClass}>
        Categories
      </NavLink>
    </div>
  );
}
