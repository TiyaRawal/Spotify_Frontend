import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import { useEffect, useRef, useState } from 'react';
import api from '../../utils/AxiosConfig';
import Cookies from 'js-cookie';
import {DashboardMusicPlayer,DashboardNav,DashboardSidebar} from './Dashboard';

function DashboardDescription() {
    let navigate = useNavigate();
    const audioRef = useRef(new Audio());
    const [currentSong, setCurrentSong] = useState(null);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [volume, setVolume] = useState(100);
    const [likedSongs, setLikedSongs] = useState([]);

    useEffect(() => {
        const audio = audioRef.current;

        function UpdateTime() {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration || 0);
        }

        function SongEnded() {
            NextSong();
        }

        audio.addEventListener("timeupdate",UpdateTime);
        audio.addEventListener("loadedmetadata", UpdateTime);
        audio.addEventListener("ended",SongEnded);

        return () => {
            audio.removeEventListener("timeupdate",UpdateTime);
            audio.removeEventListener("loadedmetadata",UpdateTime);
            audio.removeEventListener("ended",SongEnded);
        };
    }, [currentTrackIndex, currentSong]);

    async function FetchDashboard() {
        try {
            await api.get("/dashboard");
        } catch (e) {
            Cookies.remove("token");
            navigate("/login");
        }
    }

    async function StartMusic(song, trackIndex = 0) {
        if (
            !song.tracks || song.tracks.length === 0
        ) {
            return;
        }

        const track = song.tracks[trackIndex];
        setCurrentTrackIndex(trackIndex);
        setCurrentSong(song);
        setCurrentTrack(track);

        try {
            await api.post("/recentlyplayed",
                {
                    songId: song._id
                }
            );
        } catch (e) {
            console.log("Recently played error:",e);
        }

        audioRef.current.pause();
        audioRef.current.src = track.audio;
        audioRef.current.load();
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => {
                setIsPlaying(true);
            })
            .catch((err) => {
                console.log("Error playing audio:", err);
            });
    }

    function ToggleMusic() {
        if (!currentTrack) {
            return;
        }

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => {
                    setIsPlaying(true);
                })
                .catch((e) => {
                    console.log(e);
                });
        }
    }

    function NextSong() {
        if (!currentSong) {
            return;
        }
        let nextIndex = currentTrackIndex + 1;
        if (nextIndex >= currentSong.tracks.length
        ) {
            nextIndex = 0;
        }
        StartMusic(currentSong,nextIndex);
    }

    function PreviousSong() {
        if (!currentSong) {
            return;
        }

        let previousIndex = currentTrackIndex - 1;
        if (previousIndex < 0) {
            previousIndex = currentSong.tracks.length - 1;
        }
        StartMusic(currentSong,previousIndex);
    }

    function ChangeProgress(value) {
        audioRef.current.currentTime = value;
        setCurrentTime(value);
    }

    function ChangeVolume(value) {
        setVolume(value);
        audioRef.current.volume = value / 100;
    }

    async function FetchLikedSongs() {
        try {
            let response = await api.get("/getlikedsong");
            if (response.status === 200) {
                setLikedSongs(response.data.songs || []);
            }
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        FetchLikedSongs();
        FetchDashboard();
    }, []);

    async function LikeSong(songId) {
        try {
            await api.post("/likedsong",
                {
                    songId
                }
            );
            FetchLikedSongs();
        } catch (e) {
            alert(e.response?.data?.message || e.message);
        }
    }

    async function DownloadSong() {
        if (!currentTrack) {
            alert("Please select a song first.");
            return;
        }

        if (!currentTrack.audio) {
            alert("Download file is not available.");
            return;
        }

        try {
            let response = await api.get("/profile");
            if (response.status !== 200) {
                alert("Unable to check Premium status.");
                return;
            }
            let profile = response.data.profile;
            let isPremium = profile?.isPremium === true || profile?.premium === true || profile?.subscription === "Premium";

            if (!isPremium) {
                alert("Download is available for Premium users only.");
                return;
            }

            let downloadUrl = currentTrack.audio;

            if (downloadUrl.includes("/upload/")) 
                {
                downloadUrl =downloadUrl.replace("/upload/","/upload/fl_attachment/");
            }
            let link = document.createElement("a");
            link.href = downloadUrl;
            link.setAttribute("download", currentTrack.title || "song");
            link.style.display ="none";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.log("Download error:",e);
            alert(e.response?.data?.message || e.message || "Unable to download song.");
        }
    }

    return (
        <>
            <div className='dashboard-page'>
                <DashboardNav />
                <div className='dash-main'>
                    <div className='dash-main-left'>
                        <DashboardSidebar />
                    </div>
                    <div className='dash-main-right'>
                        <DashboardDescriptionContent
                            StartMusic={StartMusic}
                            ToggleMusic={ToggleMusic}
                            currentSong={currentSong}
                            currentTrack={currentTrack}
                            isPlaying={isPlaying}
                            LikeSong={LikeSong}
                            likedSongs={likedSongs}
                            DownloadSong={DownloadSong}/>
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
                    ChangeVolume={ChangeVolume}/>
            </div>
        </>
    );
}

function DashboardDescriptionContent({StartMusic,ToggleMusic,currentSong,currentTrack,isPlaying,LikeSong,likedSongs,DownloadSong}) 
{
    let location =useLocation();
    let id =location.pathname.split("/")[2];
    let [songDescription,setSongDescription] = useState([]);

    async function FetchSongDescription() {
        try {
            let response = await api.get(`/songDescription/${id}`);
            if (response.status === 200) {
                setSongDescription(response.data.songDescription);
            }
        } catch (e) {
            alert(e.response?.data?.message || e.message || "Failed to load description");
        }
    }

    useEffect(() => {
        FetchSongDescription();
    }, [id]);

    return (
        <>
            <div>
                {songDescription.map((value) => {
                        return (
                            <div key={ value._id}>
                                <div className='dash-song-title'>
                                    <img src={value.image} alt="song1"/>
                                    <div className='dash-song-info'>
                                        <h4>Single</h4>
                                        <h1>{value.title}</h1>
                                        <h2>{value.artist}&nbsp;&nbsp;{value.year}&nbsp;&nbsp; {value.tracks?.length || 0} songs &nbsp;&nbsp;{value.duration}</h2>
                                    </div>
                                </div>

                                <div className="dash-song-section">
                                    <div className="dash-song-actions">
                                        <i id="description-play" className={
                                                currentSong?._id == value._id && isPlaying
                                                    ? "fa-solid fa-circle-pause"
                                                    : "fa-solid fa-circle-play"
                                            }
                                            onClick={() => {
                                                if (
                                                    currentSong?._id === value._id
                                                ) {
                                                    ToggleMusic();
                                                } else {
                                                    StartMusic(value);
                                                     }}} ></i>

                                        <img src={value.image} alt="song1"/>
                                        <i className={
                                                likedSongs.some(song => song._id == value._id) 
                                                ? "fa-solid fa-circle-check" : "fa-solid fa-circle-plus"} 
                                                onClick={() => LikeSong(value._id)}></i>
                                        <i className="fa-solid fa-circle-down" onClick={DownloadSong}></i>
                                    </div>

                                    <div className="dash-table-head">
                                        <span>#</span>
                                        <span>Title</span>
                                        <i className="fa-regular fa-clock"></i>
                                    </div>

                                    {value.tracks?.map(
                                        (track, index) => {
                                            let isActive = currentSong?._id === value._id && currentTrack?.title === track.title;
                                            return (
                                                <div key={track.trackNo || index} className={`dash-song-row ${isActive ? "active-track" : "" }`}onClick={() => StartMusic(value,index)}>

                                                    <span className="dash-song-number">{isActive && isPlaying ? (<i className="fa-solid fa-music"></i>)  : (index + 1)}</span>

                                                    <div className="dash-song-detail">
                                                        <h3>{track.title || "Track Title"}</h3>
                                                        <p> {track.artist || "Artists"}</p>
                                                    </div>
                                                    <span>{track.duration || "0:00"}</span>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        );
                    }
                )}
            </div>
        </>
    );
}

export default DashboardDescription;