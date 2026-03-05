import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { isAdminAccount } from "../utils/auth";

type Props = {
  children: ReactNode;
  adminOnly?: boolean;
};

const ProtectedRoute = ({ children, adminOnly = false }: Props) => {
  const token = localStorage.getItem("token");
  const isAdmin = isAdminAccount();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!adminOnly && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
