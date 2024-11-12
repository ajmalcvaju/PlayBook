import { Route,Routes,BrowserRouter as Router } from 'react-router-dom'
import './App.css'
import Layout from './layouts/Layout'
import Register from './pages/Register'
import { useForm } from 'react-hook-form'

type RegisterFormData={
  firstName:string,
  lastName:string,
  email:string,
  password:string,
  confirmPassword:string
}


function App() {
     const {register}=useForm<RegisterFormData>()
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Layout/>}/>
        <Route path='/search' element={<Layout/>}/>
        <Route path='/register' element={<Layout><Register/></Layout>}/>
        <Route path='*' element={<Layout/>}/>
      </Routes>
    </Router>

  )
}

export default App
