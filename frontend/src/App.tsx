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
import AdminDashboard from './pages/adminDashboard'
import TurfPages from './pages/Users/TurfPages'
import SlotManagement from './pages/Turfs/SlotManagement'
import BookTurf from './pages/Users/BookTurf'
import UserManagement from './pages/Admins/UserManagement'
import TurfManagement from './pages/Admins/TurfManagement'
import BookingConfirmation from './pages/Users/BookingConfirmation'
import BookingManagement from './pages/Turfs/BookingManagement'
import BookingList from './pages/Users/BookingList'
import BookingListAdmin from './pages/Admins/BookingListAdmin'
import ChatWithTurf from './pages/Users/chatWithTurf'



function App() {
    
  return (
    <Router>
      <Routes>
      <Route path='/' element={<Layout user='user'><Home/></Layout>}/>
        <Route path='/register' element={<Layout user='user' page='authentication'><Register/></Layout>}/>
        <Route path='/otp' element={<Layout user='user' page='authentication'><Otp/></Layout>}/>
        <Route path='/login' element={<Layout user='user' page='authentication'><Login/></Layout>}/>
        <Route path='/home' element={<Layout user='user'><Home/></Layout>}/>
        <Route path='/turf-page/:id' element={<Layout user='user'><TurfPages/></Layout>}>
        <Route path='book-ticket' element={<BookTurf/>}>
        {/* <Route path='booking-confirmation' element={<BookingConfirmation/>}/> */}
        </Route>
        <Route path='chat-with-turf' element={<ChatWithTurf/>}></Route>
        </Route>
        <Route path='/booking-list' element={<Layout user='user'><BookingList/></Layout>}/>
        <Route path='/list-turf' element={<Layout user='turf' page='authentication'><ListTurf/></Layout>}/>
        <Route path='/turfOtp' element={<Layout user='turf' page='authentication'><OtpTurf/></Layout>}/>
        <Route path='/turf-login' element={<Layout user='turf' page='authentication'><TurfLogin/></Layout>}/>
        <Route path='/turf/dashboard' element={<Layout user="turf" page='dashboard'><TurfDashBoard/></Layout>}/>
        {/* <Route path='/turf/turf-management' element={<Layout user="turf" page='turf-management'><TurfManagement/></Layout>}/> */}
        <Route path='/turf/slot-management' element={<Layout user="turf" page='slot-management'><SlotManagement/></Layout>}/>
        <Route path='/turf/booking-management' element={<Layout user="turf" page='booking-management'><BookingManagement/></Layout>}/>
        <Route path='/turf/details-update' element={<Layout user="turf" page="upgrade-details"><TurfDetailsUpdate/></Layout>}/>
        <Route path='/adminLogin' element={<Layout user='admin' page='authentication'><AdminLogin/></Layout>}/>
        <Route path='/admin/dashboard' element={<Layout user="admin" page='dashboard'><AdminDashboard/></Layout>}/>
        <Route path='/admin/user-management' element={<Layout user="admin" page='user-management'><UserManagement/></Layout>}/>
        <Route path='/admin/turf-management' element={<Layout user="admin" page='turf-management'><TurfManagement/></Layout>}/>
        <Route path='/admin/booking-list' element={<Layout user="admin" page='booking-list'><BookingListAdmin/></Layout>}/>
        {/* <Route path='/login' element={<Layout user='user' page='authentication'><Login/></Layout>}/>
        <Route path='/otp' element={<Layout user='user' page='authentication'><Otp/></Layout>}/>
        <Route path='/home' element={<Layout user='user'><Home/></Layout>}/>
        <Route path='/adminLogin' element={<Layout user='admin'><AdminLogin/></Layout>}/>
        <Route path='*' element={<Layout/>}/> */}
      </Routes>
    </Router>

  )
}

export default App
