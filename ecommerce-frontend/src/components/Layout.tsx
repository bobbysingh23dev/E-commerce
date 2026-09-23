import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import WelcomeBanner from "./WelcomeBanner";

// Nav links share this style; NavLink gives us an active state for free.
const navLink = ({ isActive }: { isActive: boolean }) =>
  isActive ? "text-fg" : "link-muted";

export default function Layout() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <div className="flex min-h-screen flex-col">
      {/* ---- Sticky frosted nav ---- */}
      <header className="glass sticky top-0 z-50 border-b border-line">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          {/* Wordmark: a glowing gradient mark + gradient text */}
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-linear-to-br from-accent to-accent-2 text-sm font-bold text-white shadow-[0_6px_18px_-4px_rgba(124,92,246,0.8)] transition-transform group-hover:scale-105">
              B
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Bobby&apos;s <span className="gradient-text">Shop</span>
            </span>
          </Link>

          <div className="flex items-center gap-5 text-sm">
            <NavLink to="/" end className={navLink}>
              Shop
            </NavLink>

            {user?.role === "admin" && (
              <NavLink to="/admin/products" className={navLink}>
                Admin
              </NavLink>
            )}

            {user && (
              <NavLink to="/orders" className={navLink}>
                Orders
              </NavLink>
            )}

            {/* Cart pill with a live glowing badge */}
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 rounded-full border border-line bg-white/5 px-3.5 py-1.5 font-medium text-fg transition hover:bg-white/10"
            >
              <BagIcon />
              Cart
              {itemCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-linear-to-br from-accent to-accent-2 px-1 text-xs font-bold text-white shadow-[0_0_12px_rgba(139,92,246,0.8)]">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <NavLink to="/account" className={navLink}>
                  {user.name.split(" ")[0]}
                </NavLink>
                <button onClick={logout} className="link-muted">
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLink}>
                  Log in
                </NavLink>
                <Link to="/register" className="btn-primary px-4 py-2">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ---- Page content ---- */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <WelcomeBanner />
        <Outlet />
      </main>

      {/* ---- Footer ---- */}
      <footer className="mt-12 border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-faint sm:flex-row">
          <span className="font-display font-semibold text-muted">
            Bobby&apos;s <span className="gradient-text">Shop</span>
          </span>
          <span>Crafted with care · {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

function BagIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
