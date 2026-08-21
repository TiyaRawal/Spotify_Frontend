import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import api from '../../utils/AxiosConfig';
import '../styles/Login.css'
import cookie from 'js-cookie'

function Login() {
  return (
    <div className='login-bg'>
      <LoginForm/>
    </div>
  )
}

function LoginForm() {
  let navigate=useNavigate();
  let [user,setUser]=useState({
    email:"",
  })

  function HandleInputChange(e){
    let{name,value}=e.target;
    setUser((prev)=>({
        ...prev,
        [name]:value
    }))
}
let HandleSubmit=async(e)=>{
    e.preventDefault()
    try{
        let response=await api.post("/login",user)
        if(response.status===200){
            setUser({
            email:"",
            })
            cookie.set("token",response.data.token);
            alert(response.data.message);
            navigate("/dashboard")
        }
        
    }
    catch(e){
        setUser({
        email:"",
        })
        alert(e.response?.data?.message || "Login failed!")
    }
  }    

  return (
    <>
    <div className='login-container'>
      <div className='logo'>
        <img src="../Images/spotify.png" alt="Spotify Logo" />
      </div>
      <h1>Welcome back</h1>
      <form onSubmit={HandleSubmit}>
        <label htmlFor="email">Email</label>
        <input onChange={HandleInputChange} value={user.email} type="email" id="email" name="email" required />
        <button className='continue-btn' type="submit">Continue</button>
      </form>
     
        <span>or</span>
        <div>
            <button className='icon-btn'><img src="../Images/phone.png" alt="Phone" /> Continue with phone number</button>
            <button className='icon-btn'><img src="../Images/google.png" alt="Google" /> Continue with Google</button>
            <button className='icon-btn'><img src="../Images/facebook.png" alt="Facebook" /> Continue with Facebook</button>
            <button className='icon-btn'><img src="../Images/apple.png" alt="Apple" /> Continue with Apple</button>
        </div>
        <div className='account'>
            <p>Don't have an account? </p>
            <Link to="/signup">Sign up</Link>

        </div>
        
    </div>

     <div className='login-footer'>
      <p>This site is protected by reCAPTCHA and the Google Privacy<br/>Policy and Terms of Service apply.</p>
    </div>

    </>

  )
}






export default Login
