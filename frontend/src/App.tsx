import { Route,Routes,BrowserRouter as Router } from 'react-router-dom'
import './App.css'
import Layout from './layouts/Layout'
import Register from './pages/Register'
import ListTurf from './pages/ListTurf'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import TurfLogin from './pages/TurfLogin'
import Otp from './pages/Otp'
import OtpTurf from './pages/OtpTurf'
import Home from './pages/Home'
import TurfDashBoard from './pages/TurfDashBoard'
import TurfDetailsUpdate from './pages/TurfDetailsUpdate'
import AdminDashboard from './pages/Admins/adminDashboard'
import TurfPages from './pages/Users/TurfPages'
import SlotManagement from './pages/Turfs/SlotManagement'
import BookTurf from './pages/Users/BookTurf'
import UserManagement from './pages/Admins/UserManagement'
import TurfManagement from './pages/Admins/TurfManagement'
import BookingConfirmation from './pages/Users/BookingConfirmation'
import BookingManagement from './pages/Turfs/BookingManagement'
import BookingList from './pages/Users/BookingList'
import BookingListAdmin from './pages/Admins/BookingListAdmin'
// import ChatWithTurf from './pages/Users/chatWithTurf'
import ChatWithUser from './pages/Turfs/ChatWithUser'
import VideoCall from './pages/Users/VideoCall'
import ChatWithTurf from './pages/Users/ChatWithTurf'
import PaymentConfirmation from './pages/Users/PaymentConfirmation'
import { NotificationProvider } from './NotificationContext'
import Profile from './pages/Users/Profile'
import ChatUserList from './pages/Turfs/ChatUserList'
import RateTurfs from './pages/Users/RateTurfs'
import VideoCallUser from './pages/Turfs/VideoCallUser'
import AudioCall from './pages/Users/AudioCall'
import AudioCallUser from './pages/Turfs/AudioCallUser'
import ProtectedRoute, { AuthPrivateRoute } from './ProtectedRoute'
import ForgotPassword from './pages/Users/ForgotPassword'
import ForgotTurfPassword from './pages/Turfs/ForgotTurfPassword'
import TurfProtectedRoute, { TurfAuthProtectedRoute } from './TurfProtectedRoute'
import AdminProtectedRoute, { AdminAuthProtectedRoute } from './AdminProtectedRoute'
import TurfSidePanel from './components/TurfSidePanel'
import FormTeam from './pages/Users/FormTeam'




function App() {
    
  return (
    <Router>
      <Routes>
      <Route element={<AuthPrivateRoute/>}>
        <Route path='/register' element={<Layout user='user' page='authentication'><Register/></Layout>}/>
        <Route path='/otp' element={<Layout user='user' page='authentication'><Otp/></Layout>}/>
        <Route path='/login' element={<Layout user='user' page='authentication'><Login/></Layout>}/>
        <Route path='/forgot-password' element={<Layout user='user' page='authentication'><ForgotPassword/></Layout>}/>
        </Route>
        <Route element={<ProtectedRoute/>}>
        <Route path='/' element={<Layout user='user'><Home/></Layout>}/>
        <Route path='/home' element={<Layout user='user'><Home/></Layout>}/>
        <Route path='/profile' element={<Layout user='user'><Profile/></Layout>}/>
        <Route path='/form-team' element={<Layout user='user'><FormTeam/></Layout>}/>
        <Route path="/turf-page/:id" element={<Layout user="user"><TurfPages /></Layout>}>
        <Route path="rate-turf" element={<RateTurfs />} />
         <Route path="book-ticket" element={<BookTurf />}>
        <Route path="payment-confirmation" element={<PaymentConfirmation />} />
        </Route>
        <Route path="chat-with-turf" element={<ChatWithTurf />}>
        <Route path="video-call" element={<VideoCall/>} />
        <Route path="audio-call" element={<AudioCall/>} />
      </Route>
      </Route>
        <Route path='/booking-list' element={<Layout user='user'><BookingList/></Layout>}/>
        </Route>
        <Route element={<TurfAuthProtectedRoute/>}>
        <Route path='/list-turf' element={<Layout user='turf' page='authentication'><ListTurf/></Layout>}/>
        <Route path='/turfOtp' element={<Layout user='turf' page='authentication'><OtpTurf/></Layout>}/>
        <Route path='/turf-login' element={<Layout user='turf' page='authentication'><TurfLogin/></Layout>}/>
        <Route path='/forgot-turf-password' element={<Layout user='user' page='authentication'><ForgotTurfPassword/></Layout>}/>
        </Route>
        <Route element={<TurfProtectedRoute/>}>
        <Route path='/turf/dashboard' element={<NotificationProvider><Layout user="turf" page='dashboard'><TurfDashBoard/></Layout></NotificationProvider>}/>
        <Route path='/turf/slot-management' element={<NotificationProvider><Layout user="turf" page='slot-management'><SlotManagement/></Layout></NotificationProvider>}/>
        <Route path='/turf/turf-chat' element={<NotificationProvider><Layout user="turf" page='customer-chat'><ChatWithUser/></Layout></NotificationProvider>}/>
        <Route path="/turf/customer-chat" element={<NotificationProvider><Layout user="turf" page="customer-chat"><ChatUserList /></Layout></NotificationProvider>}>
         <Route path="chat" element={<ChatWithUser />}>
        <Route path="video-call" element={<VideoCallUser/>} />
        <Route path="audio-call" element={<AudioCallUser/>} />
        </Route>
        </Route>
        <Route path='/turf/booking-management' element={<NotificationProvider><Layout user="turf" page='booking-management'><BookingManagement/></Layout></NotificationProvider>}/>
        <Route path='/turf/details-update' element={<NotificationProvider><Layout user="turf" page="upgrade-details"><TurfDetailsUpdate/></Layout></NotificationProvider>}/>
        </Route>
        <Route element={<AdminAuthProtectedRoute/>}>
        <Route path='/adminLogin' element={<Layout user='admin' page='authentication'><AdminLogin/></Layout>}/>
        </Route>
        <Route element={<AdminProtectedRoute/>}>
        <Route path='/admin/dashboard' element={<Layout user="admin" page='dashboard'><AdminDashboard/></Layout>}/>
        <Route path='/admin/user-management' element={<Layout user="admin" page='user-management'><UserManagement/></Layout>}/>
        <Route path='/admin/turf-management' element={<Layout user="admin" page='turf-management'><TurfManagement/></Layout>}/>
        <Route path='/admin/booking-list' element={<Layout user="admin" page='booking-list'><BookingListAdmin/></Layout>}/>
        </Route>
      </Routes>
    </Router>

  )
}

export default App
