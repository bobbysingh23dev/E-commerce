import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

// Gate for admin-only pages. Two different failures, two different redirects:
//  - not logged in  -> send to login (and back after)
//  - logged in, but not an admin -> send home (they simply can't be here)
export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
