import { useEffect, useRef, useState } from "react";
import "../styles/Profile.css";
import { DashboardMusicPlayer, DashboardNav, DashboardSidebar} from "./Dashboard";
import api from "../../utils/AxiosConfig";
import { UploadImage } from "../../utils/Cloudinary";

function Profile() {
    const audioRef = useRef(new Audio());
    const nextSongRef = useRef(() => {});
    const previousSongRef = useRef(() => {});
    const toggleShuffleRef = useRef(() => {});
    const toggleRepeatRef = useRef(() => {});
    const [currentSong, setCurrentSong] = useState(null);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [volume, setVolume] = useState(100);
    const [shuffle, setShuffle] = useState(false);
    const [repeat, setRepeat] = useState(false);

    return (
        <div className="dashboard-page">
            <DashboardNav />
            <div className="dash-main">
                <div className="dash-main-left">
                    <DashboardSidebar />
                </div>
                <div className="dash-main-right">
                    <ProfileContent
                        audioRef={audioRef}
                        currentSong={currentSong}
                        setCurrentSong={setCurrentSong}
                        currentTrack={currentTrack}
                        setCurrentTrack={setCurrentTrack}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        currentTime={currentTime}
                        setCurrentTime={setCurrentTime}
                        duration={duration}
                        setDuration={setDuration}
                        currentIndex={currentIndex}
                        setCurrentIndex={setCurrentIndex}
                        shuffle={shuffle}
                        setShuffle={setShuffle}
                        repeat={repeat}
                        setRepeat={setRepeat}
                        nextSongRef={nextSongRef}
                        previousSongRef={previousSongRef}
                        toggleShuffleRef={toggleShuffleRef}
                        toggleRepeatRef={toggleRepeatRef}/>
                </div>
            </div>
            <DashboardMusicPlayer
                currentSong={currentSong}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                audioRef={audioRef}

                ToggleMusic={() => {
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
                }}
                currentTime={currentTime}
                duration={duration}
                ChangeProgress={(value) => {
                    audioRef.current.currentTime = value;
                    setCurrentTime(value);
                }}

                NextSong={() => {
                    nextSongRef.current();
                }}

                PreviousSong={() => {
                    previousSongRef.current();
                }}

                volume={volume}
                ChangeVolume={(value) => {
                    setVolume(value);
                    audioRef.current.volume = value / 100;
                }}

                shuffle={shuffle}

                ToggleShuffle={() => {
                    toggleShuffleRef.current();
                }}

                repeat={repeat}

                ToggleRepeat={() => {
                    toggleRepeatRef.current();
                }}/>
        </div>
    );
}

function ProfileContent({
    audioRef,
    currentSong,
    setCurrentSong,
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    currentIndex,
    setCurrentIndex,
    shuffle,
    setShuffle,
    repeat,
    setRepeat,
    nextSongRef,
    previousSongRef,
    toggleShuffleRef,
    toggleRepeatRef
}) 

{
    let [profile, setProfile] = useState({});
    let [username, setUsername] = useState("");
    let [editName, setEditName] = useState(false);
    let [recentSongs, setRecentSongs] = useState([]);
    let [selectedImage, setSelectedImage] = useState(null);
    let [imagePreview, setImagePreview] = useState("");
    let [saving, setSaving] = useState(false);

    async function FetchProfile() {
        try {
            let response = await api.get("/profile");
            if (response.status === 200) {
                setProfile(response.data.profile);
                setUsername(
                    response.data.profile.username ||
                    response.data.profile.email.split("@")[0]
                );
            }
        } catch (e) {
            alert(e.response?.data?.message || e.message );
        }
    }

    async function UpdateProfile() {
        try {
            setSaving(true);
            let imageUrl = profile.profileImage;
            if (selectedImage) {
                imageUrl = await UploadImage(selectedImage);
            }
            let response = await api.put("/profile", {
                    username: username,
                    profileImage: imageUrl
                });

            if (response.status === 200) {
                setProfile({
                    ...profile,
                    username: username,
                    profileImage: imageUrl
                });

                setSelectedImage(null);
                setImagePreview("");
                setEditName(false);
            }
        } catch (e) {
            alert(e.response?.data?.message || e.message);
        } finally {
            setSaving(false);
        }
    }

    function CancelEdit() {
        setUsername( profile.username || profile.email?.split("@")[0] ||"");
        setSelectedImage(null);
        setImagePreview("");
        setEditName(false);
    }

    function HandleImageChange(e) {
        let file = e.target.files[0];
        if (!file) {
            return;
        }

        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
    }

    async function FetchRecentlyPlayed() {
        try {
            let response = await api.get("/recentlyplayed");
            if (response.status === 200) {
                setRecentSongs(response.data.songs || []);
            }
        } catch (e) {
            alert(e.response?.data?.message ||e.message);
        }
    }

    function StartMusic(
        song,
        trackIndex = 0
    ) {
        if (
            !song.tracks || song.tracks.length === 0
        ) {
            return;
        }
        let index = recentSongs.findIndex(
                (value) => value._id === song._id
            );

        let track =song.tracks[trackIndex];
        if (!track) {
            return;
        }

        setCurrentSong(song);
        setCurrentTrack(track);
        setCurrentIndex(
            index >= 0 ? index : 0 );

        audioRef.current.pause();
        audioRef.current.src = track.audio;
        audioRef.current.load();
        audioRef.current.currentTime = 0;
        audioRef.current.play() .then(() => {
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
        if (
            recentSongs.length === 0
        ) {
            return;
        }
        let nextIndex;
        if (
            shuffle && recentSongs.length > 1
        ) {
            do {
                nextIndex = Math.floor(Math.random() * recentSongs.length );
            } while (
                nextIndex === currentIndex
            );

        } else {
            nextIndex = currentIndex + 1;
            if (
                nextIndex >= recentSongs.length
            ) {
                nextIndex = 0;
            }
        }

        StartMusic(
            recentSongs[nextIndex]
        );
    }

    function PreviousSong() {
        if (
            recentSongs.length === 0
        ) {
            return;
        }
        let previousIndex;
        if (
            shuffle && recentSongs.length > 1
        ) {
            do {
                previousIndex = Math.floor( Math.random() * recentSongs.length);
            } while (
                previousIndex === currentIndex
            );
        } else {
            previousIndex = currentIndex - 1;
            if ( previousIndex < 0
            ) {
                previousIndex = recentSongs.length - 1;
            }
        }

        StartMusic(
            recentSongs[previousIndex]
        );
    }

    function ToggleShuffle() {
        setShuffle(!shuffle );
    }

    function ToggleRepeat() {
        setRepeat(!repeat);
    }

    nextSongRef.current = NextSong;
    previousSongRef.current = PreviousSong;
    toggleShuffleRef.current = ToggleShuffle;
    toggleRepeatRef.current = ToggleRepeat;

    function ChangeProgress(value) {
        audioRef.current.currentTime =value;
        setCurrentTime(value);
    }

    function ChangeVolume(value) {
        audioRef.current.volume = value / 100;
    }

    function FormatJoinedDate(date) {
        if (!date) {
            return "";
        }
        let joined = new Date(date);
        if (
            isNaN(
                joined.getTime()
            )
        ) {
            return "";
        }

        return joined.toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );
    }

    useEffect(() => {
        FetchProfile();
        FetchRecentlyPlayed();
    }, []);

    useEffect(() => {
        let audio = audioRef.current;

        function UpdateTime() {
            setCurrentTime( audio.currentTime);
            setDuration( audio.duration || 0);
        }

        audio.addEventListener(
            "timeupdate",
            UpdateTime
        );
        audio.addEventListener(
            "loadedmetadata",
            UpdateTime
        );

        return () => {
            audio.removeEventListener(
                "timeupdate",
                UpdateTime
            );
            audio.removeEventListener(
                "loadedmetadata",
                UpdateTime
            );
        };
    }, []);

    useEffect(() => {
        let audio = audioRef.current;

        function SongEnded() {
            if (
                recentSongs.length === 0
            ) {
                return;
            }
            if (repeat) {
                StartMusic(currentSong);
                return;
            }

            let nextIndex;
            if (
                shuffle && recentSongs.length > 1
            ) {
                do {
                    nextIndex = Math.floor(Math.random() * recentSongs.length );
                } while (
                    nextIndex === currentIndex
                );
            } else {
                nextIndex = currentIndex + 1;
                if (
                    nextIndex >= recentSongs.length
                ) {
                    nextIndex = 0;
                }
            }

            StartMusic(
                recentSongs[nextIndex]
            );
        }

        audio.addEventListener(
            "ended",
            SongEnded
        );

        return () => {
            audio.removeEventListener(
                "ended",
                SongEnded
            );
        };
    }, [recentSongs,currentIndex, shuffle,repeat, currentSong]);

    let profileImage = imagePreview || profile.profileImage || "../Images/1.png";

    return (
        <>
            <div className="profile-header">
                <div className="profile-image-wrapper">
                    <img src={profileImage} alt="profile"/>

                    {editName && (
                        <label htmlFor="profileImage" className="profile-camera">
                            <i className="fa-solid fa-camera"></i>
                        </label>
                    )}

                    <input type="file" id="profileImage" hidden accept="image/*" onChange={HandleImageChange}/>
                </div>

                <div className="profile-info">
                    <h4> Profile </h4>

                    {editName ? (
                        <input className="profile-name-input" type="text"value={username} onChange={(e) => setUsername( e.target.value) } autoFocus />
                    ) : (
                        <h1> {username}</h1>
                    )}
                    <h2>Joined{" "} {FormatJoinedDate( profile.joinedDate )} </h2>

                    {!editName ? (
                        <button className="edit-profile-btn" onClick={() => setEditName(true)}>
                            <i className="fa-solid fa-pen"></i>
                            Edit Profile
                        </button>
                    ) : (
                        <div className="profile-edit-actions">
                            <button className="profile-save-btn" onClick={UpdateProfile} disabled={saving}> { saving ? "Saving..." : "Save"} </button>
                            <button className="profile-cancel-btn" onClick={ CancelEdit } disabled={saving}> Cancel </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-recent">
                <div className="profile-recent-heading">
                    <h2> Recently Played </h2>
                    <p> Show all </p>
                </div>

                {recentSongs.length > 0 ? (
                    recentSongs.map((value, index) => {
                            let isActive = currentSong?._id === value._id && isPlaying;
                            return (
                                <div className={`profile-recent-row ${isActive ? "active-recent-song" : "" }`}
                                    key={value._id} onClick={() => {
                                        if (
                                            currentSong?._id === value._id
                                        ) {
                                            ToggleMusic();
                                        } else {
                                            StartMusic(
                                                value
                                            );
                                        }
                                    }}>
                                    <span>{isActive ? ( <i className="fa-solid fa-music"></i>) : ( index + 1 )} </span>

                                    <div className="profile-recent-detail">
                                        <img src={value.image} alt=""/>

                                        <div>
                                            <h3> {value.title} </h3>
                                            <p> {value.artist} </p>
                                        </div>
                                    </div>
                                    <p>{value.duration}</p>
                                </div>
                            );
                        }
                    )
                ) : (
                    <p className="no-recent-songs"> No recently played songs </p>
                )}
            </div>
        </>
    );
}


export default Profile;