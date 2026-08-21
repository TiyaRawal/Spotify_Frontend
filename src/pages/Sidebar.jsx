import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/sidebar.css'
import api from '../../utils/AxiosConfig'

function Sidebar() {

  let [showPlaylistPopup, setShowPlaylistPopup] = useState(false)
  let [podcastCategory, setPodcastCategory] = useState(null)
  let navigate = useNavigate()

  async function FetchPodcastCategory() {
    try {
      let response = await api.get("/browseCategory")
      if (response.status === 200) {
        let categories = response.data.browseCategory || []
        let podcast = categories.find(
          (item) => item.title?.toLowerCase() === "podcasts"
        )
        if (podcast) {
          setPodcastCategory(podcast)
        }
      }
    } catch (e) {
      console.log(e.response)
    }
  }

  useEffect(() => {
    FetchPodcastCategory()
  }, [])

  function BrowsePodcasts() {
    if (podcastCategory) {
      navigate(`/browse/${podcastCategory._id}`)
    }
  }

  return (
    <div className='main-left'>
      <div className='library'>
        <h2>Your Library</h2>
        <button onClick={() => setShowPlaylistPopup(true)}>+</button>
      </div>
      <div className='container'>
        <div className='box'>
          <h3>Create your first playlist</h3>
          <p>It's easy, we'll help you</p>
          <button onClick={() => setShowPlaylistPopup(true)}>Create Playlist</button>
        </div>
      </div>

      <div className='container'>
        <div className='box'>
          <h3>Let's find some podcasts to follow</h3>
          <p> We'll keep you updated on new episodes </p>
          <button onClick={BrowsePodcasts}> Browse Podcasts </button>
        </div>
      </div>

      <div className='sidebar-links'>
        <a href="https://www.spotify.com/in-en/legal/end-user-agreement/">Legal</a>
        <a href="https://www.spotify.com/in-en/safetyandprivacy">Safety & Privacy Center</a>
        <a href="https://www.spotify.com/in-en/legal/privacy-policy/">Privacy Policy </a>
        <a href="https://www.spotify.com/in-en/legal/cookies-policy/"> Cookies</a>
        <a href="https://www.spotify.com/in-en/legal/privacy-policy/#s3"> About Ads</a>
        <a href="https://www.spotify.com/in-en/accessibility">Accessibility</a>
      </div>

      {showPlaylistPopup && (
        <div className="playlist-popup-overlay">
          <div className="playlist-popup">
            <h2> Create a playlist</h2>
            <p>Log in to create and share playlists.</p>
            <div className="playlist-popup-buttons">
              <button className="playlist-popup-notnow" onClick={() =>setShowPlaylistPopup(false)}> Not now </button>
              <a href="/login" className="playlist-popup-login">Log in </a>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Sidebar