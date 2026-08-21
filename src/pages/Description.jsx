import React, { useEffect, useState } from 'react'
import '../styles/home.css'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import Preview from './Preview'
import api from '../../utils/AxiosConfig'
import { useLocation,Link } from 'react-router-dom'

function Description() {
  return (
    <>
     <Header/>
    <div className='main'>
      <Sidebar/>
      <div className='main-right'>
      <DescriptionMain/>
      <Footer/>
      </div>
    </div>
    <Preview/>
    </> 
  )
}

function DescriptionMain(){
    let location = useLocation();
    let id = location.pathname.split("/")[2]
    let [songDescription,setSongDescription]= useState([])
    let [showLoginPopup, setShowLoginPopup] = useState(false);
    let [showPlaylistPopup, setShowPlaylistPopup] = useState(false)

     async function FetchSongDescription() {
        try {
            let response = await api.get(`/songDescription/${id}`)
            if (response.status == 200) {
                setSongDescription(response.data.songDescription)
            }
        }
        catch (e) {
            alert(e.response?.data?.message || e.message || "Failed to load description")
        }        
    }

    useEffect(() => {
        FetchSongDescription()
    }, [id])

    return(
        <>
           <div>
            {songDescription.map((value) =>{
              return(
              <>
       <div>
        <div className='dash-song-title'>
            <img src={value.image} alt="song1" />
            <div className='dash-song-info'>
            <h4>Single</h4>
            <h1>{value.title}</h1>
            <h2>{value.artist}   {value.year}   {value.tracks.length} songs   {value.duration}</h2>
            </div>
        </div>

    <div className="dash-song-section">
    <div className="dash-song-actions">
        <i id="description-play" class="fa-solid fa-circle-play" onClick={() => setShowLoginPopup(true)}></i>
        <i class="fa-solid fa-circle-plus" onClick={() => setShowPlaylistPopup(true)}></i>
    </div>
    <div className="dash-table-head">
        <span>#</span>
        <span>Title</span>
        <i class="fa-regular fa-clock"></i>
    </div>

    { value.tracks.map((track, index) => {
        return (
            <>
    <div className="dash-song-row" onClick={() => setShowLoginPopup(true)}>
        <span>{index + 1}</span>
        <div className="dash-song-detail">
            <h3>{track.title || "Track Title"}</h3>
            <p>{track.artist || "Artists"}</p>
        </div>
        <span>{track.duration || "0:00"}</span>
    </div>
            </>
        )
    })}
    </div>
    </div>
              </>)
            })}
    </div>

      {showLoginPopup && (
        <div className="login-popup-overlay">
          <div className="login-popup">
            <button className="login-popup-close" onClick={() => setShowLoginPopup(false)} > × </button>
            <div className="login-popup-content">
              <h1> Start listening with a <br />free Spotify account </h1>
              <Link to="/signup" className="login-popup-signup">  Sign up free </Link>
              <p> Already have an account? <Link to="/login"> Log in </Link> </p>
            </div>
          </div>
        </div>
      )}

        {showPlaylistPopup && (
        <div className="playlist-popup-overlay">
          <div className="playlist-popup">
            <h2>Create a playlist</h2>
            <p>Log in to create and share playlists.</p>
            <div className="playlist-popup-buttons">
              <button className="playlist-popup-notnow" onClick={() => setShowPlaylistPopup(false)}>  Not now </button>
              <a href="/login" className="playlist-popup-login">Log in</a>
            </div>
          </div>
        </div>
      )}
        </>
    )
}

export default Description



