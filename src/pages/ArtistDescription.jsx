import React,{useEffect,useState,useRef} from 'react';
import {useParams} from 'react-router-dom';
import '../styles/ArtistDescription.css';
import api from '../../utils/AxiosConfig';
import {DashboardMusicPlayer,DashboardNav,DashboardSidebar} from './Dashboard';

function ArtistDescription(){
    let {id}=useParams();
    let [artist,setArtist]=useState({});
    let [songs,setSongs]=useState([]);
    let [currentSong,setCurrentSong]=useState(null);
    let [currentTrack,setCurrentTrack]=useState(null);
    let [isPlaying,setIsPlaying]=useState(false);
    let [currentTime,setCurrentTime]=useState(0);
    let [duration,setDuration]=useState(0);
    let [currentIndex,setCurrentIndex]=useState(0);
    let [volume,setVolume]=useState(100);
    let [shuffle,setShuffle]=useState(false);
    let audioRef=useRef(new Audio());

    async function FetchArtist(){
        try{
            let response=await api.get("/artists");
            if(response.status===200){
                let artists=response.data.artists||[];
                let foundArtist=artists.find((value)=>value._id===id);
                if(foundArtist){
                    setArtist(foundArtist);
                }
            }
        }catch(e){
            console.log(e);
        }
    }

    async function FetchSongs(artistData){
        try{
            let response=await api.get("/songs");
            if(response.status===200){
                let allSongs=response.data.songs||[];
                let artistSongs=allSongs.filter((song)=>
                    artistData.popularSongs?.includes(song._id)
                );
                setSongs(artistSongs);
            }
        }catch(e){
            console.log(e);
        }
    }

    useEffect(()=>{
        FetchArtist();
    },[id]);

    useEffect(()=>{
        if(artist._id){
            FetchSongs(artist);
        }
    },[artist]);

    useEffect(()=>{
        let audio=audioRef.current;

        function UpdateTime(){
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration||0);
        }

        function SongEnded(){
            NextSong();
        }

        audio.addEventListener("timeupdate",UpdateTime);
        audio.addEventListener("loadedmetadata",UpdateTime);
        audio.addEventListener("ended",SongEnded);

        return()=>{
            audio.removeEventListener("timeupdate",UpdateTime);
            audio.removeEventListener("loadedmetadata",UpdateTime);
            audio.removeEventListener("ended",SongEnded);
        };
    },[currentIndex,songs]);

    async function StartMusic(song){
        if(!song.tracks||song.tracks.length===0) return;

        let index=songs.findIndex((item)=>item._id===song._id);
        let track=song.tracks[0];

        setCurrentSong(song);
        setCurrentTrack(track);
        setCurrentIndex(index>=0?index:0);

        try{
            await api.post("/recentlyplayed",{songId:song._id});
        }catch(e){
            console.log(e);
        }

        audioRef.current.pause();
        audioRef.current.src=track.audio;
        audioRef.current.load();
        audioRef.current.currentTime=0;

        audioRef.current.play()
        .then(()=>{
            setIsPlaying(true);
        })
        .catch((e)=>{
            console.log("Error playing audio:",e);
        });
    }

    function ToggleMusic(){
        if(!currentTrack) return;

        if(isPlaying){
            audioRef.current.pause();
            setIsPlaying(false);
        }else{
            audioRef.current.play();
            setIsPlaying(true);
        }
    }

    function NextSong(){
        if(songs.length===0) return;

        setCurrentIndex((prevIndex)=>{
            let nextIndex;

            if(shuffle){
                do{
                    nextIndex=Math.floor(Math.random()*songs.length);
                }
                while(songs.length>1&&nextIndex===prevIndex);
            }else{
                nextIndex=prevIndex+1;

                if(nextIndex>=songs.length){
                    nextIndex=0;
                }
            }

            StartMusic(songs[nextIndex]);
            return nextIndex;
        });
    }

    function PreviousSong(){
        if(songs.length===0) return;

        setCurrentIndex((prevIndex)=>{
            let previousIndex;

            if(shuffle){
                do{
                    previousIndex=Math.floor(Math.random()*songs.length);
                }while(songs.length>1&&previousIndex===prevIndex);
            }else{
                previousIndex=prevIndex-1;

                if(previousIndex<0){
                    previousIndex=songs.length-1;
                }
            }
            StartMusic(songs[previousIndex]);
            return previousIndex;
        });
    }

    function ChangeProgress(value){
        audioRef.current.currentTime=value;
        setCurrentTime(value);
    }

    function ChangeVolume(value){
        setVolume(value);
        audioRef.current.volume=value/100;
    }

    function ToggleShuffle(){
        setShuffle(!shuffle);
    }

    return(
        <div className="dashboard-page">
            <DashboardNav/>
            <div className="dash-main">
                <div className="dash-main-left">
                    <DashboardSidebar/>
                </div>
                <div className="dash-main-right">
                    <div className="artist-page">
                        <div className="artist-banner" style={{backgroundImage:`url(${artist.coverImage||artist.image})`}}>
                            <div className="artist-overlay">
                                <p>Artist</p>
                                <h1>{artist.name}</h1>
                                <h3>{artist.followers||"0 monthly listeners"}</h3>
                            </div>
                        </div>

                        <div className="artist-content">
                            <div className="artist-actions">
                                <button className="artist-play-btn" onClick={()=>{
                                    if(currentSong){
                                        ToggleMusic();
                                    }
                                    else if(songs.length>0){
                                        StartMusic(songs[0]);
                                    }
                                }}>
                                    <i className={currentSong&&isPlaying?"fa-solid fa-pause":"fa-solid fa-play"}></i>
                                </button>
                            </div>

                            <div className="popular-section">
                                <h2>Popular</h2>

                                <div className="song-table-head">
                                    <span className="song-number-head">#</span>
                                    <span className="song-title-head">Title</span>
                                    <i className="fa-regular fa-clock"></i>
                                </div>

                                {songs.length>0?songs.map((song,index)=>{ 
                                    let isActive=currentSong?._id===song._id;

                                    return(
                                        <div className={`song-row ${isActive?"active-song":""}`} key={song._id} onClick={()=>StartMusic(song)}>
                                            <span className="song-number">
                                                {isActive?<i className="fa-solid fa-music"></i>:index+1}
                                            </span>

                                            <div className="song-info">
                                                <img src={song.image} alt={song.title}/>

                                                <div>
                                                    <h3>{song.title}</h3>
                                                    <p>{song.artist}</p>
                                                </div>
                                            </div>

                                            <span className="song-time">
                                                {song.duration||"0:00"}
                                            </span>
                                        </div>
                                    );
                                }):
                                <p className="no-songs">No songs available.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DashboardMusicPlayer
                currentSong={currentSong}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                audioRef={audioRef}
                ToggleMusic={ToggleMusic}
                currentTime={currentTime}
                duration={duration}
                ChangeProgress={ChangeProgress}
                NextSong={NextSong}
                PreviousSong={PreviousSong}
                volume={volume}
                ChangeVolume={ChangeVolume}
                shuffle={shuffle}
                ToggleShuffle={ToggleShuffle}
            />
        </div>
    );
}

export default ArtistDescription;