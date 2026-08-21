import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Login.css'
import api from '../../utils/AxiosConfig';

function Signup(){
    let navigate = useNavigate();
    let[user,setUser]=useState({
        email:"",
    })

    function HandelInputChange(e){
        let{name,value}=e.target;
        setUser((prev)=>({
            ...prev,
            [name]:value
        }))
    }

    let HandelSubmit=async(e)=>{
        e.preventDefault();
        try{
            let response=await api.post("/signup",user)
            setUser({
                email:"",
            })
            if(response.status===201){
                alert(response.data.message);
                navigate("/login")
            }
        }catch(e){
            setUser({
                email:"",
            })
            alert(e.response?.data?.message || "Signup failed")
        }
    }

    return(
        <>
        <div className='login-bg'>
        <div className='login-container'>
      <div className='logo'>
        <img src="../Images/spotify.png" alt="Spotify Logo" />
      </div>
      <h1>Sign up to start listening</h1>
      <form onSubmit={HandelSubmit}>
        <label htmlFor="email">Email address</label>
        <input onChange={HandelInputChange} value={user.email} type="email" id="email" name="email" placeholder="name@domain.com" required />
        <button className='continue-btn' type="submit">Next</button>
      </form>
     
        <span>or</span>
        <div>
            <button className='icon-btn'><img src="../Images/phone.png" alt="Phone" /> Continue with phone number</button>
            <button className='icon-btn'><img src="../Images/google.png" alt="Google" /> Continue with Google</button>
            <button className='icon-btn'><img src="../Images/apple.png" alt="Apple" /> Continue with Apple</button>
        </div>
        <div className='account'>
            <p>Already have an account? </p>
            <Link to="/login">Log in</Link>
        </div>
    </div>

     <div className='login-footer'>
      <p>This site is protected by reCAPTCHA and the Google Privacy<br/>Policy and Terms of Service apply.</p>
    </div>
    </div>
        </>
    )
}

export default Signup
