import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

interface RootState {
  admin: {
    isAuthenticated: boolean;
  };
}

function AdminProtectedRoute() {
  const { isAuthenticated } = useSelector((state: RootState) => state.admin);

  return isAuthenticated ? <Outlet /> : <Navigate to="/adminLogin" />;
}

export function AdminAuthProtectedRoute() {
  const { isAuthenticated } = useSelector((state: RootState) => state.admin);

  return isAuthenticated ? <Navigate to="/admin/dashboard" /> : <Outlet />;
}

export default AdminProtectedRoute;


