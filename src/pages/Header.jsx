import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import "../styles/header.css";

function Header() {
  let [search, setSearch] = useState("")
  let navigate = useNavigate()

  function SearchSong() {
    if (!search.trim()) return
    navigate(`/?query=${encodeURIComponent(search)}`)
    setSearch("")
  }

  return (
    <>
    <nav>
    <div className='nav-left'>
        <div className='head-logo'>
            <i className="fa-brands fa-spotify"></i>
        </div>

        <div className='home-icon'>
            <Link to="/"><i className="fa-solid fa-home"></i> </Link>
        </div>

        <div className='search-bar'>
            <div className='search-icon'>
                <i className="fa-solid fa-magnifying-glass"></i>
            </div>

            <input className='input-box' type="text" placeholder='What do you want to play?' value={search} onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        SearchSong()
                    }
                }} />

            <div className='browse-icon'>
                <Link to="/browse"> <i className="fa-solid fa-folder-open"></i> </Link>
            </div>
        </div>
    </div>

    <div className='nav-right'>
        <div className='text'>
            <a href="https://download.scdn.co/SpotifySetup.exe" download> <i className="fa-regular fa-circle-down"></i> Install App </a>
        </div>

        <div className='text'>
            <Link to="/signup"> Sign up </Link>
        </div>

        <button className='login-btn'>
            <Link to="/login"> Log in </Link>
        </button>
    </div>
    </nav>
    </>
  )
}

export default Header