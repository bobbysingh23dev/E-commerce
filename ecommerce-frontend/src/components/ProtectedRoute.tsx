import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

// Gate for pages that need a logged-in user (e.g. cart, orders, account).
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // <Navigate> redirects. We stash the attempted URL in `state` so the
    // login page can send the user right back after they sign in.
    // `replace` swaps the history entry so "Back" doesn't loop to here.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
