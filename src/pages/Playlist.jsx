import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/Playlist.css";
import api from "../../utils/AxiosConfig";
import { DashboardMusicPlayer, DashboardNav, DashboardSidebar } from "./Dashboard";

function Playlist() {
    let { id } = useParams();
    let [playlist, setPlaylist] = useState({});
    let [songs, setSongs] = useState([]);
    let [showSongs, setShowSongs] = useState(false);
    let audioRef = useRef(new Audio());
    let [currentSong, setCurrentSong] = useState(null);
    let [currentTrack, setCurrentTrack] = useState(null);
    let [isPlaying, setIsPlaying] = useState(false);
    let [currentTime, setCurrentTime] = useState(0);
    let [duration, setDuration] = useState(0);
    let [currentIndex, setCurrentIndex] = useState(0);
    let [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    let [volume, setVolume] = useState(100);

    async function FetchPlaylist() {
        try {
            let response = await api.get(`/playlist/${id}`);
            if (response.status === 200) {
                setPlaylist(response.data.playlist);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async function FetchSongs() {
        try {
            let response = await api.get("/songs");

            if (response.status === 200) {
                setSongs(response.data.songs);
            }
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        FetchPlaylist();
        FetchSongs();
    }, [id]);

    async function AddSong(songId) {
        try {
            await api.post("/playlist/addsong", {
                playlistId: id,
                songId
            });

            FetchPlaylist();
            setShowSongs(false);
        } catch (e) {
            console.log(e);
        }
    }

    function StartMusic(song, trackIndex = 0) {
        if (!song.tracks || song.tracks.length === 0) {
            return;
        }

        let playlistIndex = playlist.songs?.findIndex(
            (value) => value._id === song._id
        );

        if (playlistIndex === -1 || playlistIndex === undefined) {
            playlistIndex = 0;
        }

        let track = song.tracks[trackIndex];

        setCurrentSong(song);
        setCurrentTrack(track);
        setCurrentIndex(playlistIndex);
        setCurrentTrackIndex(trackIndex);

        audioRef.current.pause();
        audioRef.current.src = track.audio;
        audioRef.current.load();
        audioRef.current.currentTime = 0;
        audioRef.current.play()
            .then(() => {
                setIsPlaying(true);
            })
            .catch((e) => {
                console.log("Error playing audio:", e);
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
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch((e) => {
                    console.log(e);
                });
        }
    }

    function NextSong() {
        if (!playlist.songs || playlist.songs.length === 0) {
            return;
        }

        let nextIndex = currentIndex + 1;
        if (nextIndex >= playlist.songs.length) {
            nextIndex = 0;
        }

        StartMusic(playlist.songs[nextIndex]);
    }

    function PreviousSong() {
        if (!playlist.songs || playlist.songs.length === 0) {
            return;
        }

        let previousIndex = currentIndex - 1;
        if (previousIndex < 0) {
            previousIndex = playlist.songs.length - 1;
        }

        StartMusic(playlist.songs[previousIndex]);
    }

    function ChangeProgress(value) {
        audioRef.current.currentTime = value;
        setCurrentTime(value);
    }

    function ChangeVolume(value) {
        setVolume(value);
        audioRef.current.volume = value / 100;
    }

    useEffect(() => {
        let audio = audioRef.current;

        function UpdateTime() {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration || 0);
        }

        audio.addEventListener("timeupdate", UpdateTime);
        audio.addEventListener("loadedmetadata", UpdateTime);

        return () => {
            audio.removeEventListener("timeupdate", UpdateTime);
            audio.removeEventListener("loadedmetadata", UpdateTime);
        };
    }, []);

    useEffect(() => {
        let audio = audioRef.current;

        function SongEnded() {
            if (!playlist.songs || playlist.songs.length === 0) {
                return;
            }

            let nextIndex = currentIndex + 1;
            if (nextIndex >= playlist.songs.length) {
                nextIndex = 0;
            }

            StartMusic(playlist.songs[nextIndex]);
        }

        audio.addEventListener("ended", SongEnded);

        return () => {
            audio.removeEventListener("ended", SongEnded);
        };
    }, [playlist.songs, currentIndex]);

    return (
        <div className="dashboard-page">
            <DashboardNav />
            <div className="dash-main">
                <div className="dash-main-left">
                    <DashboardSidebar />
                </div>
                <div className="dash-main-right">
                    <div className="playlist-header">
                        <div className="playlist-image">
                            <i className="fa-solid fa-music"></i>
                        </div>
                        <div className="playlist-info">
                            <p>Public Playlist</p>
                            <h1>{playlist.title}</h1>
                            <h3> Created by You • {playlist.songs?.length || 0} songs</h3>
                        </div>
                    </div>

                    <div className="playlist-body">
                        <div className="playlist-top">
                            <button className="playlist-play" onClick={() => {
                                    if (currentSong) {
                                        ToggleMusic();
                                    } else if (playlist.songs?.length > 0) {
                                        StartMusic(playlist.songs[0]);
                                    }
                                }}>
                                <i className={currentSong && isPlaying ? "fa-solid fa-circle-pause" : "fa-solid fa-circle-play" }></i>
                            </button>

                            <div className="playlist-title">
                                <h2>Playlist Songs</h2>
                                <p> {playlist.songs?.length || 0} Songs </p>
                            </div>

                            <button className="playlist-add" onClick={() => setShowSongs(!showSongs)} > + Add Songs </button>
                        </div>

                        {
                            showSongs &&
                            <div className="playlist-song-list">
                                {
                                    songs.map((song) => (
                                        <div className="playlist-add-item" key={song._id}>
                                            <img src={song.image} alt="" />
                                            <div className="playlist-add-info">
                                                <h3> {song.title} </h3>
                                                <p> {song.artist} </p>
                                            </div>
                                            <button onClick={() => AddSong(song._id)} >  Add </button>
                                        </div>
                                    ))
                                }
                            </div>
                        }

                        <div className="playlist-songs">
                            {
                                playlist.songs?.map((song, index) => {
                                    let isActive = currentSong?._id === song._id && isPlaying;
                                    return (
                                        <div className="playlist-row" key={song._id} onClick={() => {
                                                if (currentSong?._id === song._id) {
                                                    ToggleMusic();
                                                } else {
                                                    StartMusic(song);
                                                }
                                            }} >
                                            <span className="playlist-number">{ isActive ? <i className="fa-solid fa-music"></i> : index + 1} </span>
                                            <img src={song.image} alt="" />

                                            <div className="playlist-details">
                                                <h3 style={{ color: isActive  ? "#1ed760" : "white" }}> {song.title}</h3>
                                                <p> {song.artist} </p>
                                            </div>

                                            <span className="playlist-duration"> {song.duration} </span>
                                        </div>
                                    );
                                })
                            }
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
            />
        </div>
    );
}

export default Playlist;