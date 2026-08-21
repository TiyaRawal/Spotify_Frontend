import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/Preview.css'

function Preview() {
  return (
    <div>
      <div className="preview-banner">
    <div className="banner-text">
        <h3>Preview of Spotify</h3>
        <p> Sign up to get unlimited songs and podcasts with occasional ads. No credit card needed.</p>
    </div>

   <Link to="/signup"> <button>Sign up for free</button></Link>
</div>
    </div>
  )
}

export default Preview
