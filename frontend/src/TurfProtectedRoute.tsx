import { useSelector } from "react-redux"
import { Outlet,Navigate } from "react-router-dom"

function TurfProtectedRoute() {
const {currentTurf} = useSelector(state=>state.turf)
  return currentTurf? <Outlet/> : <Navigate to='/turf-login'/>
}
export function TurfAuthProtectedRoute() {
    const {currentTurf} = useSelector(state=>state.turf)
  return currentTurf? <Navigate to='/turf/dashboard'/>:<Outlet/> 
}

export default TurfProtectedRoute

