import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import Footer from './Footer'
import '../styles/home.css'
import Header from './Header'
import Preview from './Preview'
import api from '../../utils/AxiosConfig'
import { Link, useLocation } from 'react-router-dom'

function Home() {
  return (
    <>
      <Header />
      <div className='main'>
        <Sidebar />
        <div className='main-right'>
          <HomeContent />
          <Footer />
        </div>
      </div>
      <Preview />
    </>
  )
}

function HomeContent() {
  let [songs, setSongs] = useState([])
  let [artists, setArtists] = useState([])
  let [showLoginPopup, setShowLoginPopup] = useState(false)
  let [searchSong, setSearchSong] = useState(null)
  let location = useLocation()

  async function FetchSongs() {
    try {
      let response = await api.get("/songs")
      if (response.status === 200) {
        setSongs(response.data.songs)
      }
    } catch (e) {
      console.log(e.response)
      alert( e.response?.data?.message || "Failed to load songs" )
    }
  }

  async function FetchArtists() {
    try {
      let response = await api.get("/artists")
      if (response.status === 200) {
        setArtists(response.data.artists)
      }
    } catch (e) {
      console.log(e.response)
      alert( e.response?.data?.message || "Failed to load artists" )
    }
  }

  async function SearchSong() {
    let search = new URLSearchParams(location.search).get("query")
    if (!search) {
      setSearchSong(null)
      return
    }
    try {
      let response = await api.get( `/search?query=${search}`)
      if (response.status === 200) {
        setSearchSong(response.data.song)
      }
    } catch (e) {
      console.log(e.response)
      setSearchSong(null)
    }
  }

  useEffect(() => {
    FetchSongs()
    FetchArtists()
  }, [])

  useEffect(() => {
    SearchSong()
  }, [location.search])

  return (
    <>
      {searchSong && (
        <div className='music-section'>
          <h1>Search Result</h1>
          <div className='songs'>
            <Link to={`/description/${searchSong._id}`} className='music-card'>
              <img src={searchSong.image} alt={searchSong.title}/>

              <div className="play-btn" onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowLoginPopup(true)
                }}>
                <i className="fa-solid fa-circle-play"></i>
              </div>
              <h1> {searchSong.title} </h1>
              <p> {searchSong.artist} </p>
            </Link>
          </div>
        </div>
      )}

      <div className='music-section'>
        <h1>Trending songs</h1>
        <div className='songs'>
          {songs.map((song) => {
            return (
              <Link to={`/description/${song._id}`} className='music-card' key={song._id}>
                <img src={song.image} alt={song.title} />

                <div className="play-btn" onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowLoginPopup(true)
                  }}>
                  <i className="fa-solid fa-circle-play"></i>
                </div>

                <h1> {song.title} </h1>
                <p> {song.artist} </p>
              </Link>
            )
          })}
        </div>
      </div>

      <div className='music-section'>
        <h1>Popular Artists</h1>
        <div className='songs'>
          {artists.map((artist) => {
            return (
              <div className='music-card artist-card' key={artist._id}>
                <img src={artist.image} alt={artist.name}/>
                <div className="play-btn" onClick={() => setShowLoginPopup(true)}>
                  <i className="fa-solid fa-circle-play"></i>
                </div>
                <h1> {artist.name} </h1>
                <p> Artist </p>
              </div>
            )
          })}
        </div>
      </div>

      {showLoginPopup && (
        <div className="login-popup-overlay">
          <div className="login-popup">
            <button className="login-popup-close" onClick={() => setShowLoginPopup(false)} > × </button>

            <div className="login-popup-content">
              <h1> Start listening with a <br /> free Spotify account</h1>
              <Link to="/signup" className="login-popup-signup"> Sign up free</Link>
              <p> Already have an account? <Link to="/login"> Log in </Link> </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Home