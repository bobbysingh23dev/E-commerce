import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

// Gate staff pages by role. Admin can access every staff page, while other
// staff roles must be explicitly listed by the route.
export default function AdminRoute({
  children,
  allowedRoles = [],
}: {
  children: ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user.role !== "admin" && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
