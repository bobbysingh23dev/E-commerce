import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import WelcomeBanner from "./WelcomeBanner";

// A layout wraps every page with shared chrome (here: a top nav bar).
// <Outlet /> is the placeholder React Router fills with the active route.
export default function Layout() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          {/* Link renders an <a> but navigates WITHOUT a full page reload. */}
          <Link to="/" className="text-xl font-bold text-slate-900">
            Bobby&apos;s Shop
          </Link>

          <div className="flex items-center gap-4 text-sm text-slate-600">
            <Link to="/" className="hover:text-slate-900">
              Products
            </Link>

            {/* Cart link with a badge. itemCount comes from the cart context,
                so this number updates the instant an item is added anywhere. */}
            <Link to="/cart" className="relative hover:text-slate-900">
              Cart
              {itemCount > 0 && (
                <span className="ml-1 rounded-full bg-slate-900 px-1.5 py-0.5 text-xs font-medium text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* The nav re-renders automatically when `user` changes, because
                it reads from the auth context. Logged in vs out shows
                different links. */}
            {user ? (
              <>
                {/* Role-gated UI: only admins ever see this link. The backend
                    still enforces it too — this just hides what they can't use. */}
                {user.role === "admin" && (
                  <Link
                    to="/admin/products"
                    className="font-medium text-slate-900 hover:underline"
                  >
                    Admin
                  </Link>
                )}
                <Link to="/orders" className="hover:text-slate-900">
                  Orders
                </Link>
                <Link to="/account" className="hover:text-slate-900">
                  {user.name}
                </Link>
                <button
                  onClick={logout}
                  className="text-slate-500 hover:text-slate-900"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-slate-900">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* AI greeting appears here after login, above whatever page is active */}
        <WelcomeBanner />
        <Outlet />
      </main>
    </div>
  );
}
