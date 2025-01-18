import { useSelector } from "react-redux"
import { Outlet,Navigate } from "react-router-dom"

function AdminProtectedRoute() {
    const {admin} = useSelector(state=>state.admin)
  return admin? <Outlet/> : <Navigate to='/adminLogin'/>
}

export function AdminAuthProtectedRoute() {
const {admin} = useSelector(state=>state.admin)
return admin? <Navigate to='/admin/dashboard'/>:<Outlet/>
}

export default AdminProtectedRoute

