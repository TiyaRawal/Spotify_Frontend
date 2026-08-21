import React,{useEffect,useRef,useState} from 'react'
import '../styles/LikedSong.css'
import {DashboardMusicPlayer,DashboardNav,DashboardSidebar} from './Dashboard'
import api from '../../utils/AxiosConfig'

function LikedSong(){
    const audioRef=useRef(new Audio());
    const [currentSong,setCurrentSong]=useState(null);
    const [currentTrack,setCurrentTrack]=useState(null);
    const [isPlaying,setIsPlaying]=useState(false);
    const [currentTime,setCurrentTime]=useState(0);
    const [duration,setDuration]=useState(0);
    const [currentTrackIndex,setCurrentTrackIndex]=useState(0);
    const [volume,setVolume]=useState(100);

    function StartMusic(song,trackIndex=0){
        if(!song.tracks||song.tracks.length===0)return;
        const track=song.tracks[trackIndex];
        setCurrentTrackIndex(trackIndex);
        setCurrentSong(song);
        setCurrentTrack(track);
        audioRef.current.pause();
        audioRef.current.src=track.audio;
        audioRef.current.load();
        audioRef.current.currentTime=0;
        audioRef.current.play()
        .then(()=>{
            setIsPlaying(true);
        })
        .catch((err)=>{
            console.log("Error playing audio:",err);
        });
    }

    function ToggleMusic(){
        if(!currentTrack)return;
        if(isPlaying){
            audioRef.current.pause();
            setIsPlaying(false);
        }else{
            audioRef.current.play()
            .then(()=>{
                setIsPlaying(true);
            })
            .catch((err)=>{
                console.log(err);
            });
        }
    }

    function NextSong(){
        if(!currentSong)return;
        let nextIndex=currentTrackIndex+1;
        if(nextIndex>=currentSong.tracks.length){
            nextIndex=0;
        }
        StartMusic(currentSong,nextIndex);
    }

    function PreviousSong(){
        if(!currentSong)return;
        let previousIndex=currentTrackIndex-1;
        if(previousIndex<0){
            previousIndex=currentSong.tracks.length-1;
        }
        StartMusic(currentSong,previousIndex);
    }

    function ChangeProgress(value){
        audioRef.current.currentTime=value;
        setCurrentTime(value);
    }

    function ChangeVolume(value){
        setVolume(value);
        audioRef.current.volume=value/100;
    }

    useEffect(()=>{
        const audio=audioRef.current;
        function UpdateTime(){
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration||0);
        }
        audio.addEventListener("timeupdate",UpdateTime);
        audio.addEventListener("loadedmetadata",UpdateTime);
        return()=>{
            audio.removeEventListener("timeupdate",UpdateTime);
            audio.removeEventListener("loadedmetadata",UpdateTime);
        };
    },[]);

    return(
        <div className='dashboard-page'>
            <DashboardNav/>
            <div className='dash-main'>
                <div className='dash-main-left'>
                    <DashboardSidebar/>
                </div>
                <div className='dash-main-right'>
                    <LikedSongContent
                        StartMusic={StartMusic}
                        ToggleMusic={ToggleMusic}
                        currentSong={currentSong}
                        currentTrack={currentTrack}
                        isPlaying={isPlaying}
                    />
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
            />
        </div>
    )
}

function LikedSongContent({StartMusic,ToggleMusic,currentSong,currentTrack,isPlaying}){
    let [likedSongs,setLikedSongs]=useState([]);

    async function FetchLikedSongs(){
        try{
            let response=await api.get("/getlikedsong");
            if(response.status===200){
                setLikedSongs(response.data.songs);
            }
        }catch(e){
            alert(e.response?.data?.message||e.message);
        }
    }

    useEffect(()=>{
        FetchLikedSongs();
    },[]);

    return(
        <>
            <div className="liked-song-title">
                <img src="../Images/Like.png" alt="Liked Song"/>
                <div className="liked-song-info">
                    <h4>Playlist</h4>
                    <h1>Liked Songs</h1>
                    <h2>Tiya</h2>
                </div>
            </div>
            <div className="liked-song-section">
                <div className="liked-table-head">
                    <span className="liked-number-head">#</span>
                    <span className="liked-title-head">Title</span>
                    <span className="liked-date-head">Date Added</span>
                    <i className="liked-duration-head fa-regular fa-clock"></i>
                </div>
                {likedSongs.length>0?
                    likedSongs.map((value,index)=>{
                        let isActive=currentSong?._id===value._id&&isPlaying;
                        return(
                            <div
                                className={`liked-song-row ${isActive?"active-liked-song":""}`}
                                onClick={()=>{
                                    if(currentSong?._id===value._id){
                                        ToggleMusic();
                                    }else{
                                        StartMusic(value);
                                    }
                                }}
                                key={value._id}>
                                <span className="liked-number">
                                    {isActive? <i className="fa-solid fa-pause"></i> :  index+1 }
                                </span>
                                <div className="liked-song-detail">
                                    <img src={value.image} alt={value.title}/>
                                    <div>
                                        <h3>{value.title}</h3>
                                        <p>{value.artist}</p>
                                    </div>
                                </div>
                                <p className="liked-date">
                                    {value.dateAdded? new Date(value.dateAdded).toLocaleDateString() :  "" }
                                </p>
                                <p className="liked-duration">
                                    {value.duration||"0:00"}
                                </p>
                            </div>
                        )
                    })
                    :
                    <p className="no-liked-songs">No liked songs</p>
                }
            </div>
        </>
    )
}

export default LikedSong