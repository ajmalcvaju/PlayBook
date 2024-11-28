import { Route,Routes,BrowserRouter as Router } from 'react-router-dom'
import './App.css'
import Layout from './layouts/Layout'
import Register from './pages/Register'
import { useForm } from 'react-hook-form'
import ListTurf from './pages/ListTurf'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import TurfLogin from './pages/TurfLogin'
import Otp from './pages/Otp'
import OtpTurf from './pages/OtpTurf'
import Home from './pages/Home'
import TurfSidePanel from './components/TurfSidePanel'
import TurfDashBoard from './pages/TurfDashBoard'
import TurfDetailsUpdate from './pages/TurfDetailsUpdate'
import AdminDashboard from './pages/adminDashboard'



function App() {
    
  return (
    <Router>
      <Routes>
      <Route path='/' element={<Layout user='user'><Home/></Layout>}/>
        <Route path='/register' element={<Layout user='user' page='authentication'><Register/></Layout>}/>
        <Route path='/otp' element={<Layout user='user' page='authentication'><Otp/></Layout>}/>
        <Route path='/login' element={<Layout user='user' page='authentication'><Login/></Layout>}/>
        <Route path='/home' element={<Layout user='user'><Home/></Layout>}/>
        <Route path='/list-turf' element={<Layout user='turf' page='authentication'><ListTurf/></Layout>}/>
        <Route path='/turfOtp' element={<Layout user='turf' page='authentication'><OtpTurf/></Layout>}/>
        <Route path='/turfLogin' element={<Layout user='turf' page='authentication'><TurfLogin/></Layout>}/>
        <Route path='/turf/dashboard' element={<Layout user="turf" page='dashboard'><TurfDashBoard/></Layout>}/>
        <Route path='/turf/details-update' element={<Layout user="turf" page="upgrade-details"><TurfDetailsUpdate/></Layout>}/>
        <Route path='/adminLogin' element={<Layout user='admin' page='authentication'><AdminLogin/></Layout>}/>
        <Route path='/admin/dashboard' element={<Layout user="admin" page='dashboard'><AdminDashboard/></Layout>}/>
        {/* <Route path='/login' element={<Layout user='user' page='authentication'><Login/></Layout>}/>
        <Route path='/otp' element={<Layout user='user' page='authentication'><Otp/></Layout>}/>
        <Route path='/home' element={<Layout user='user'><Home/></Layout>}/>
        <Route path='/adminLogin' element={<Layout user='admin'><AdminLogin/></Layout>}/>
        <Route path='*' element={<Layout/>}/> */}
      </Routes>
      <Routes>
        
        </Routes>
    </Router>

  )
}

export default App
