import React from 'react'

function DashMainContent() {
    let[songs,setSongs]= useState([])
     let[artists,setArtists]= useState([])

  async function FetchSongs(){
    try{
      let response= await api.get("/songs")
      if(response.status===200){
        setSongs(response.data.songs)
      }
    }catch(e){
        console.log(e.response);
      alert(e.response?.data?.message || "Failed to load songs")
    }
  }

    async function FetchArtists(){
    try{
      let response= await api.get("/artists")
      if(response.status===200){
        setArtists(response.data.artists)
      }
    }catch(e){
        console.log(e.response);
      alert(e.response?.data?.message || "Failed to load artists")
    }
  } 
  
  useEffect(()=>{
    FetchSongs()
    FetchArtists()
  },[])


  return (
    <>
    <div className='music-section'>
      <h1>Trending songs</h1>
      <div className='songs'>
        
    {songs.map((song)=>{
        return(
            <>
    <Link to={`/description/${song._id}`} className='music-card'>
        <img src={song.image} alt="song1" />
        <div className="play-btn"><i class="fa-solid fa-circle-play"></i></div>
        <h1>{song.title}</h1>
        <p>{song.artist}</p>
      </Link>
            </>
        )

    })}

      </div>
    </div>
    
    <div className='music-section'>
        <h1>Popular Artists</h1>
        <div className='songs'>

             {artists.map((artist)=>{
        return(
            <>
        <div className='music-card artist-card'>
            <img src={artist.image} alt="artist1" />
            <div className="play-btn"><i class="fa-solid fa-circle-play"></i></div>
            <h1>{artist.name}</h1>
            <p>Artist</p>
        </div>
     
            </>
        )

    })}

        </div>
    </div>

    <div className='music-section'>
      <h1>Popular albums and singles</h1>
      <div className='music-card'>
        <img src="../Images/1.png" alt="song1" />
        <div className="play-btn"><i class="fa-solid fa-circle-play"></i></div>
        <h1>Song Name</h1>
        <p>Artist Name</p>
      </div>
    </div>

    <div className='music-section'>
      <h1>Popular radio</h1>
      <div className='music-card'>
        <img src="../Images/1.png" alt="song1" />
        <div className="play-btn"><i class="fa-solid fa-circle-play"></i></div>

        <p>Artist Name</p>
      </div>
    </div>

    <div className='music-section'>
      <h1>Featured Charts</h1>
      <div className='music-card'>
        <img src="../Images/1.png" alt="song1" />
        <div className="play-btn"><i class="fa-solid fa-circle-play"></i></div>
        <p>Artist Name</p>
      </div>
    </div>
    </>
  )
}

export default DashMainContent
