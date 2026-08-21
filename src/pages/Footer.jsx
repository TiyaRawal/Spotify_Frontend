import React from 'react'
import '../styles/Footer.css'

function Footer() {
  return (
    <>
    <div className='footer'>
      <div className='footer-section'>
        <h1>Company</h1>
        <a href="#">About</a>
        <a href="#">Jobs</a>
        <a href="#">For the Record</a>
      </div>
       <div className='footer-section'>
        <h1>Communities</h1>
        <a href="#">For Artists</a>
        <a href="#">Developers</a>
        <a href="#">Advertising</a>
        <a href="#">Investors</a>
        <a href="#">Vendors</a>
      </div>
       <div className='footer-section'>
        <h1>Useful links</h1>
        <a href="#">Support</a>
        <a href="#">Free Mobile App</a>
        <a href="#">Popular by Country </a>
        <a href="#">Top Song Lyrics</a>
        <a href="#">Import your music</a>
      </div>
       <div className='footer-section'>
        <h1>Spotify Plans</h1>
        <a href="#">Premium Standard</a>
        <a href="#">Premium Platinum</a>
        <a href="#">Premium Student</a>
        <a href="#">Spotify Free</a>
      </div>
       <div className='footer-icon'>
      <i class="fa-brands fa-instagram"></i>
      <i class="fa-brands fa-x-twitter"></i>
      <i class="fa-brands fa-facebook"></i>
    </div>
    </div>
    <div className='copyright'>
      <p>&copy; 2026 Spotify AB</p>
    </div>
   
    </>
  )
}

export default Footer
