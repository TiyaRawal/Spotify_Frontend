import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import '../styles/Dashboard.css'
import Footer from './Footer'
import api from '../../utils/AxiosConfig';
import Logout from "./Logout";
import Advertisement from "./Advertisement";

function Dashboard() {
    let navigate = useNavigate();
    const audioRef = useRef(new Audio());
    const [currentSong, setCurrentSong] = useState(null);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playlist, setPlaylist] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [volume, setVolume] = useState(100);
    const [shuffle, setShuffle] = useState(false);
    const [repeat, setRepeat] = useState(false);
    const repeatRef = useRef(false);
    const playlistRef = useRef([]);
    const currentIndexRef = useRef(0);
    const shuffleRef = useRef(false);
    const [search, setSearch] = useState("");
    const [searchedSong, setSearchedSong] = useState(null);
    const [profile, setProfile] = useState({});
    const [showAd, setShowAd] = useState(false);
    const [songsPlayed, setSongsPlayed] = useState(0);
    const [songsUntilAd, setSongsUntilAd] = useState(
        Math.random() < 0.5 ? 2 : 3
    );
    const [ad, setAd] = useState(null);
    const [nextSong, setNextSong] = useState(null);

    useEffect(() => {
        let token = Cookies.get("token");
        if (!token) {
            navigate("/login");
            return;
        }
        FetchDashboard();
        FetchProfile();
        FetchAd();
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        const UpdateTime = () => {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration || 0);
        };
        audio.addEventListener("timeupdate", UpdateTime);
        audio.addEventListener("loadedmetadata", UpdateTime);
        return () => {
            audio.removeEventListener("timeupdate", UpdateTime);
            audio.removeEventListener("loadedmetadata", UpdateTime);
        };
    }, []);

    async function FetchDashboard() {
        try {
            let response = await api.get("/dashboard");
        } catch (e) {
            Cookies.remove("token");
            navigate("/login");
        }
    }

    async function FetchProfile() {
        try {
            let response = await api.get("/profile");
            setProfile(response.data.profile);
        } catch (e) {
            console.log(e);
        }
    }

    async function FetchAd() {
        try {
            let response = await api.get("/ad");
            setAd(response.data.ad);
        } catch (e) {
            console.log(e);
        }
    }

    async function StartMusic(song, trackIndex = 0, selectedPlaylist = playlist) {
        if (!song.tracks || song.tracks.length === 0) return;

        const index = selectedPlaylist.findIndex(
            item => item._id === song._id
        );

        const track = song.tracks[trackIndex];
        const safeIndex = index >= 0 ? index : 0;

        playlistRef.current = selectedPlaylist;
        currentIndexRef.current = safeIndex;
        setPlaylist(selectedPlaylist);
        setCurrentIndex(safeIndex);
        setCurrentSong(song);
        setCurrentTrack(track);

        try {
            await api.post("/recentlyplayed", {
                songId: song._id
            });
        } catch (e) {
            console.log(e);
        }

        audioRef.current.pause();
        audioRef.current.src = track.audio;
        audioRef.current.load();
        audioRef.current.currentTime = 0;

        audioRef.current.onended = () => {
            if (repeatRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play()
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch((err) => {
                        console.log("Error replaying audio:", err);
                    });
                return;
            }
            NextSong();
        };

        audioRef.current.play()
            .then(() => {
                setIsPlaying(true);
            })
            .catch((err) => {
                console.log("Error playing audio:", err);
            });
        setIsPlaying(true);
    }

    function ToggleMusic() {
        if (!currentTrack) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    }

    function NextSong() {
        const currentPlaylist = playlistRef.current;
        const currentPosition = currentIndexRef.current;

        if (currentPlaylist.length === 0) return;
        let nextIndex;

        if (shuffleRef.current) {
            do {
                nextIndex = Math.floor(
                    Math.random() * currentPlaylist.length
                );
            } while (
                currentPlaylist.length > 1 &&
                nextIndex === currentPosition
            );
        } else {
            nextIndex = currentPosition + 1;

            if (nextIndex >= currentPlaylist.length) {
                nextIndex = 0;
            }
        }

        const song = currentPlaylist[nextIndex];

        if (!profile.premium) {
            const count = songsPlayed + 1;
            setSongsPlayed(count);

            if (count >= songsUntilAd) {
                setSongsPlayed(0);
                setSongsUntilAd(
                    Math.random() < 0.5 ? 2 : 3
                );

                setNextSong({
                    song,
                    index: nextIndex
                });
                setShowAd(true);
                return;
            }
        }

        currentIndexRef.current = nextIndex;
        setCurrentIndex(nextIndex);
        StartMusic(song, 0, currentPlaylist);
    }

    function CloseAdvertisement() {
        setShowAd(false);

        if (nextSong) {
            StartMusic(nextSong.song, 0, playlist );

            currentIndexRef.current = nextSong.index;
            setCurrentIndex(nextSong.index);
            setNextSong(null);
        }
    }

    function PreviousSong() {
        const currentPlaylist = playlistRef.current;
        const currentPosition = currentIndexRef.current;

        if (currentPlaylist.length === 0) return;
        let previousIndex;

        if (shuffleRef.current) {
            do {
                previousIndex = Math.floor( Math.random() * currentPlaylist.length);
            } while (
                currentPlaylist.length > 1 && previousIndex === currentPosition
            );
        } else {
            previousIndex = currentPosition - 1;

            if (previousIndex < 0) {
                previousIndex = currentPlaylist.length - 1;
            }
        }

        currentIndexRef.current = previousIndex;
        setCurrentIndex(previousIndex);

        StartMusic(currentPlaylist[previousIndex], 0, currentPlaylist );
    }

    function ChangeProgress(value) {
        audioRef.current.currentTime = value;
        setCurrentTime(value);
    }

    function ChangeVolume(value) {
        audioRef.current.volume = value / 100;
        setVolume(value);
    }

    function ToggleShuffle() {
        const newValue = !shuffleRef.current;
        shuffleRef.current = newValue;
        setShuffle(newValue);
    }

    function ToggleRepeat() {
        let newValue = !repeat;
        setRepeat(newValue);
        repeatRef.current = newValue;
    }

    async function SearchSong() {
        if (!search.trim()) return;

        try {
            const response = await api.get(`/search?query=${search}`);
            if (response.status === 200) {
                setSearchedSong(response.data.song);
            }
            setSearch("");
        } catch (e) {
            setSearchedSong(null);
            alert(e.response?.data?.message || "Song not found" );
        }
    }

    return (
        <div className='dashboard-page'>
            <DashboardNav search={search} setSearch={setSearch} SearchSong={SearchSong} profile={profile}/>
            <div className='dash-main'>
                <div className='dash-main-left'>
                    <DashboardSidebar />
                </div>
                <div className='dash-main-right'>
                    <DashboardMain StartMusic={StartMusic} setPlaylist={setPlaylist} currentSong={currentSong} isPlaying={isPlaying} ToggleMusic={ToggleMusic} searchedSong={searchedSong}/>
                </div>
            </div>

            {
                showAd && ad &&
                <Advertisement ad={ad} CloseAdvertisement={CloseAdvertisement}/>
            }

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
                repeat={repeat}
                ToggleRepeat={ToggleRepeat}
            />
        </div>
    )
}

function DashboardNav({ search, setSearch, SearchSong, profile }) {
    const [showProfile, setShowProfile] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        function HandleClickOutside(e) {
            if (
                profileRef.current &&
                !profileRef.current.contains(e.target)
            ) {
                setShowProfile(false);
            }
        }

        document.addEventListener(
            "mousedown",
            HandleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                HandleClickOutside
            );
        };
    }, []);

    return (
        <div>
            <nav>
                <div className='dash-nav-left'>
                    <div className='dash-head-logo'>
                        <i className="fa-brands fa-spotify"></i>
                    </div>

                    <div className='dash-home-icon'>
                        <Link to="/dashboard">
                            <i className="fa-solid fa-home"></i>
                        </Link>
                    </div>

                    <div className='dash-search-bar'>
                        <div className='dash-search-icon'>
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </div>

                        <input
                            className='dash-input-box'
                            type="text"
                            placeholder='What do you want to play?'
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    SearchSong();
                                }
                            }}
                        />

                        <div className='dash-browse-icon'>
                            <Link to="/dashbrowse">
                                <i className="fa-solid fa-folder-open"></i>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className='dash-nav-right'>
                    <button className='premium-btn'>
                        <Link to="/premium">Explore Premium </Link>
                    </button>

                    <div className='dash-text'>
                        <a href="https://download.scdn.co/SpotifySetup.exe" download>
                            <i className="fa-regular fa-circle-down"></i>
                            Install App
                        </a>
                    </div>

                    <div className='dash-user-image' ref={profileRef} >
                        <img src={profile?.profileImage || "../Images/1.png"} alt="User" onClick={() => setShowProfile(!showProfile)}/>

                        {
                            showProfile &&
                            <div className="profile-dropdown">
                                <Link to="/profile"><p>Profile</p></Link>
                                <p onClick={Logout}> Logout </p>
                            </div>
                        }
                    </div>
                </div>
            </nav>
        </div>
    )
}

function DashboardSidebar() {
    const [playlists, setPlaylists] = useState([]);

    async function FetchPlaylists() {
        try {
            const response = await api.get("/playlist");
            setPlaylists(response.data.playlists);
        } catch (e) {
            console.log(e);
        }
    }

    async function CreatePlaylist() {
        try {
            console.log("Create clicked");
            const response = await api.post("/playlist");
            console.log(response.data);
            FetchPlaylists();
        } catch (e) {
            console.log("ERROR:", e.response);
        }
    }

    useEffect(() => {
        FetchPlaylists();
    }, []);

    return (
        <>
            <div>
                <div className='dash-library'>
                    <h2>Your Library</h2>

                    <button onClick={CreatePlaylist}>  + Create  </button>
                </div>
            </div>

            <div className="import-card">
                <div className="import-content">
                    <h3>Create your first playlist</h3>
                    <p>It's easy, we'll help you</p>
                    <button onClick={CreatePlaylist}> Create playlist </button>
                </div>
            </div>

            <div className='library-content'>
                <div className='playlist'>
                    <Link to="/likedsongs">
                        <div className='playlist-item'>
                            <img src="../Images/Like.png" />

                            <div className='playlist-info'>
                                <h3>Liked Songs</h3>
                                <p>Playlist 130 songs</p>
                            </div>
                        </div>
                    </Link>

                    {playlists.map((playlist) => (
                        <Link key={playlist._id} to={`/playlist/${playlist._id}`}>
                            <div className="playlist-item">
                                <img src="../Images/music.png" />
                                <div className="playlist-info">
                                    <h3>{playlist.title}</h3>
                                    <p>Playlist | You</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}

function DashboardMain({StartMusic,setPlaylist,currentSong,isPlaying,ToggleMusic,searchedSong}) 
{
    let [songs, setSongs] = useState([]);
    let [artists, setArtists] = useState([]);
    let [recentSongs, setRecentSongs] = useState([]);

    async function FetchSongs() {
        try {
            let response = await api.get("/songs");
            if (response.status === 200) {
                setSongs(response.data.songs);
            }
        } catch (e) {
            console.log(e.response);
            alert(e.response?.data?.message || "Failed to load songs" );
        }
    }

    async function FetchArtists() {
        try {
            let response = await api.get("/artists");
            if (response.status === 200) {
                setArtists(response.data.artists);
            }
        } catch (e) {
            console.log(e.response);
            alert(e.response?.data?.message || "Failed to load artists" );
        }
    }

    async function FetchRecentlyPlayed() {
        try {
            let response = await api.get("/recentlyplayed" );
            if (response.status === 200) {
                setRecentSongs(
                    response.data.songs
                );
            }
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        FetchSongs();
        FetchArtists();
        FetchRecentlyPlayed();
    }, []);

    function PlayTrendingSong(song) {
        setPlaylist(songs);

        StartMusic(song, 0, songs);
    }

    function PlayArtistSong(artist) {
        let artistQueue = artists
            .map((artistValue) => {
                let firstSongId = artistValue.popularSongs?.[0];

                return songs.find((song) => {
                    return song._id === firstSongId;
                });
            })
            .filter(Boolean);

        let firstSong = songs.find((song) => {
            return artist.popularSongs?.[0] === song._id;
        });

        if (!firstSong) return;

        setPlaylist(artistQueue);
        StartMusic(firstSong,0, artistQueue);
    }

    function PlayRecentSong(song) {
        setPlaylist(recentSongs);
        StartMusic(song,0,recentSongs);
    }

    return (
        <>
            {searchedSong && (
                <div className='music-section'>
                    <h1>Search Result</h1>

                    <div className='songs'>
                        <Link to={`/dashboarddescription/${searchedSong._id}`} className='music-card'>
                            <img src={searchedSong.image} alt={searchedSong.title}/>

                            <div className="play-btn" onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    if (
                                        currentSong?._id === searchedSong._id
                                    ) {
                                        ToggleMusic();
                                    } else {
                                        setPlaylist([searchedSong]);
                                        StartMusic(searchedSong,0,[searchedSong]);
                                    }
                                }}
                            >
                                <i className={currentSong?._id === searchedSong._id && isPlaying ? "fa-solid fa-circle-pause" : "fa-solid fa-circle-play" }></i>
                            </div>

                            <h1>{searchedSong.title}</h1>
                            <p>{searchedSong.artist}</p>
                        </Link>
                    </div>
                </div>
            )}

            <div className='music-section'>
                <h1>Trending songs</h1>

                <div className='songs'>
                    {songs.map((song) => {
                        return (
                            <Link key={song._id} to={`/dashboarddescription/${song._id}`} className='music-card'>
                                <img src={song.image} alt={song.title}/>

                                <div className="play-btn" onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        if (
                                            currentSong?._id === song._id
                                        ) {
                                            ToggleMusic();
                                        } else {
                                            PlayTrendingSong(song);
                                        }
                                    }}
                                >
                                    <i className={ currentSong?._id === song._id && isPlaying ? "fa-solid fa-circle-pause" : "fa-solid fa-circle-play" }></i>
                                </div>

                                <h1>{song.title}</h1>
                                <p>{song.artist}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className='music-section'>
                <h1>Popular Artists</h1>

                <div className='songs'>
                    {artists.map((artist) => {
                        let artistSongs = artist.popularSongs ?.map((songId) => {
                                    return songs.find(
                                        (song) => song._id === songId
                                    );
                                }).filter(Boolean) || [];

                        let firstSong = artistSongs[0];

                        return (
                            <Link key={artist._id} to={`/artistdescription/${artist._id}`}>
                                <div className='music-card artist-card'>
                                    <img src={artist.image} alt={artist.name}/>

                            <div className="play-btn" onClick={(e) => {
                                 e.preventDefault();
                                 e.stopPropagation();

                                if (!firstSong) return;

                                if (currentSong?._id === firstSong._id) {
                                ToggleMusic();
                                } else {
                                PlayArtistSong(artist);
                                }
                                }} 
                            >
                                <i className={ currentSong?._id === firstSong?._id && isPlaying ? "fa-solid fa-circle-pause" : "fa-solid fa-circle-play"}></i>
                           </div>

                                    <h1>{artist.name}</h1>
                                    <p>Artist</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className='music-section'>
                <h1>Recently Played</h1>

                <div className='songs'>
                    {recentSongs.length > 0 ? (
                        recentSongs.map((song) => {
                            return (
                                <Link key={song._id} to={`/dashboarddescription/${song._id}`} className='music-card'>
                                    <img src={song.image} alt={song.title}/>

                                    <div className="play-btn" onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();

                                            if (
                                                currentSong?._id === song._id
                                            ) {
                                                ToggleMusic();
                                            } else {
                                                PlayRecentSong(song);
                                            }
                                        }}
                                    >
                                        <i className={currentSong?._id === song._id && isPlaying ? "fa-solid fa-circle-pause" : "fa-solid fa-circle-play"}></i>
                                    </div>

                                    <h1>{song.title}</h1>
                                    <p>{song.artist}</p>
                                </Link>
                            );
                        })
                    ) : (
                        <p> No recently played songs.</p>
                    )}
                </div>
            </div>
        </>
    )
}

function DashboardMusicPlayer({currentSong,currentTrack,isPlaying,audioRef,ToggleMusic,currentTime,duration,ChangeProgress,NextSong,PreviousSong,volume,ChangeVolume,shuffle,ToggleShuffle,repeat = false,ToggleRepeat = () => {}}) 
{
    function FormatTime(time) {
        if (!time) return "0:00";

        let minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);

        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return `${minutes}:${seconds}`;
    }

    return (
        <>
            <div className='music-player'>
                <div className='music-player-left'>
                    <img src={currentSong?.image || "../Images/Hindi.png" } alt="song"/>

                    <div className="music-info">
                        <h4>{currentTrack?.title || "Song"}</h4>
                        <p> {currentTrack?.artist || "Artist"} </p>
                    </div>
                    <i className="fa-solid fa-circle-check"></i>
                </div>

                <div className='music-player-center'>
                    <div className='music-controls'>
                        <div>
                            <i id="shuffle" className="fa-solid fa-shuffle" onClick={ToggleShuffle} style={{ color: shuffle ? "#1db954" : "white",cursor: "pointer"}}></i>
                        </div>

                        <div>
                            <i id="backward" className="fa-solid fa-backward-step" onClick={PreviousSong}></i>
                        </div>

                        <div>
                            <i id="play" onClick={ToggleMusic} className={ isPlaying ? "fa-solid fa-circle-pause" : "fa-solid fa-circle-play"}></i>
                        </div>

                        <div>
                            <i id="forward" className="fa-solid fa-forward-step" onClick={NextSong}></i>
                        </div>

                        <div>
                            <i id="repeat" className="fa-solid fa-repeat" onClick={ToggleRepeat} style={{color: repeat ? "#1db954" : "white",cursor: "pointer"}}></i>
                        </div>
                    </div>

                    <div className='music-progress'>
                        <span>{FormatTime(currentTime)}</span>

                        <input type="range" id="progressBar" min="0" max={duration || 0} value={currentTime} style={{"--progress": duration ? `${(currentTime / duration) * 100}%` : "0%" }}
                            onChange={(e) => ChangeProgress( e.target.value)}/>

                        <span>{FormatTime(duration)}</span>
                    </div>
                </div>

                <div className='music-player-right'>
                    <i className={volume == 0 ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high"}></i>

                    <div className="music-progress">
                        <input type="range" min="0" max="100" value={volume} style={{ "--progress": `${volume}%`}}
                            onChange={(e) => ChangeVolume( e.target.value)}/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard
export {DashboardNav,DashboardSidebar,DashboardMain,DashboardMusicPlayer}