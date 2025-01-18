import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

// Define the RootState interface to represent the Redux state structure
interface AdminState {
  admin: boolean; // Specify that admin is a boolean
}

interface RootState {
  admin: AdminState; // The state has an admin slice of type AdminState
}

function AdminProtectedRoute() {
  const { admin } = useSelector((state: RootState) => state.admin); // Use the correct type
  return admin ? <Outlet /> : <Navigate to="/adminLogin" />;
}

export function AdminAuthProtectedRoute() {
  const { admin } = useSelector((state: RootState) => state.admin); // Use the correct type
  return admin ? <Navigate to="/admin/dashboard" /> : <Outlet />;
}

export default AdminProtectedRoute;
