import { useSelector } from "react-redux"
import { Outlet,Navigate } from "react-router-dom"

interface CurrentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
  isVerified: number;
  isApproved: number;
  __v: number;
  latitude: number;
  longitude: number;
  locationName: string;
  isOnline: boolean;
  lastSeen: string;
}
interface UserState {
  currentUser: CurrentUser;
}
interface RootState {
  user: UserState;
}

function PrivateRoute() {
    const currentUser = useSelector((state: RootState) => state.user.currentUser);
  return currentUser? <Outlet/> : <Navigate to='/login'/>
}
export function AuthPrivateRoute() {
const currentUser = useSelector((state: RootState) => state.user.currentUser);
return currentUser? <Navigate to='/home'/>:<Outlet/> 
}

export default PrivateRoute

