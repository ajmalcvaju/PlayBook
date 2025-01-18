import { useSelector } from "react-redux"
import { Outlet,Navigate } from "react-router-dom"

function PrivateRoute() {
    const {currentUser} = useSelector(state=>state.user)
  return currentUser? <Outlet/> : <Navigate to='/login'/>
}
export function AuthPrivateRoute() {
const {currentUser} = useSelector(state=>state.user)
return currentUser? <Navigate to='/home'/>:<Outlet/> 
}

export default PrivateRoute

