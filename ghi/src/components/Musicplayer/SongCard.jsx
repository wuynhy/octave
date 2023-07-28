import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import PlayPause from "./PlayPause";
import { playPause, setActiveSong } from "../../redux/features/playerSlice";
import { useGetSongByIdQuery } from "../../redux/services/musicPlayerApi";
import useToken from "@galvanize-inc/jwtdown-for-react";

const SongCard = ({ song, isPlaying, activeSong, allSongs, i, refresh }) => {
  const dispatch = useDispatch();
  const { data: detailedSong } = useGetSongByIdQuery(song.id, {
    skip: !activeSong,
  });
  const [userData, setUserData] = useState(null);
  const songIndex = allSongs.findIndex((s) => s.id === song.id);
  const { token } = useToken();
  const isProcessing = useRef(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);

  const username = userData?.user.username || "Loading...";

  const handleUserData = async () => {
    const url = `${process.env.REACT_APP_API_HOST}/token`;
    fetch(url, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setUserData(data);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    handleUserData();
  }, []);

  const fetchPlaylists = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_HOST}/playlists`);
      const data = await res.json();
      const userPlaylists = data.filter(
        (playlist) => playlist.owner === username
      );
      setPlaylists(userPlaylists);
    } catch (err) {
      console.error(err);
    }
  }, [username]);

  async function addSongToPlaylist(playlistId, songId) {
    try {
      await fetch(
        `${process.env.REACT_APP_API_HOST}/playlists/${playlistId}/add_song/${songId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error:", error);
    }
  }

  useEffect(() => {
    if (username !== "Loading...") {
      fetchPlaylists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  async function addSongToSelectedPlaylist(e, playlistId) {
    e.stopPropagation();
    setDropdownOpen(false);
    await addSongToPlaylist(playlistId, song.id);
  }

  const handleSongClick = () => {
    if (isProcessing.current) {
      return;
    }
    isProcessing.current = true;
    if (!isPlaying || (activeSong && activeSong.id !== song.id)) {
      handlePlayClick();
    } else {
      handlePauseClick();
    }
    setTimeout(() => {
      isProcessing.current = false;
    }, 300);
  };

  const handlePauseClick = () => {
    dispatch(playPause(false));
  };

  const handlePlayClick = () => {
    const nextSong =
      songIndex < allSongs.length - 1 ? allSongs[songIndex + 1] : allSongs[0];
    const prevSong =
      songIndex > 0 ? allSongs[songIndex - 1] : allSongs[allSongs.length - 1];

    dispatch(
      setActiveSong({
        song: detailedSong || song,
        data: allSongs,
        i: songIndex,
        nextSong,
        prevSong,
      })
    );
    dispatch(playPause(true));
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div
      className="flex flex-col w-[250px] p-4 bg-white/5 bg-opacity-80 backdrop-blur-sm animate-slideup rounded-lg cursor-pointer"
      onClick={handleSongClick}
    >
      <div className="relative w-full h-56 group">
        <div
          className={`absolute inset-0 justify-center items-center bg-black bg-opacity-50 group-hover:flex ${
            activeSong?.title === song.title
              ? "flex bg-black bg-opacity-70"
              : "hidden"
          }`}
        >
          <PlayPause
            isPlaying={isPlaying}
            activeSong={activeSong}
            song={song}
            handlePause={handlePauseClick}
            handlePlay={handlePlayClick}
          />
        </div>
        <img
          alt="song_img"
          src={song?.cover_url}
          className="w-full h-full rounded-lg"
        />
      </div>

      <div className="mt-4 flex flex-col">
        <p className="font-semibold text-lg text-white truncate">
          <Link to={`/songs/${song?.id}`}>{song.artist}</Link>
        </p>
        <p className="text-sm truncate text-white mt-1">
          <Link
            to={
              song.artists
                ? `/artists/${song?.artist[0]?.adamid}`
                : "/top-artists"
            }
          >
            {song.title}
          </Link>
        </p>
      </div>
      <div className="mt-2 relative">
        <button
          className="text-xs bg-indigo-600 text-white rounded px-2 py-1"
          onClick={(e) => {
            e.stopPropagation();
            setDropdownOpen(!dropdownOpen);
          }}
        >
          Add to Playlist
        </button>
      </div>
      {dropdownOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
          className="flex items-center justify-center"
        >
          <div className="bg-white rounded shadow-lg p-8 m-4 max-w-xs max-h-full text-center overflow-auto">
            <button
              className="float-right w-10 h-10 hover:bg-red-600 text-black rounded-full p-2"
              onClick={toggleDropdown}
              style={{
                marginTop: "-25px",
                marginRight: "-20px",
              }}
            >
              x
            </button>
            <h1 className="text-xl text-black font-bold mb-4">Playlists</h1>
            {playlists.length === 0 ? (
              <p>No playlists available.</p>
            ) : (
              playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={(e) => addSongToSelectedPlaylist(e, playlist.id)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
                  role="menuitem"
                >
                  {playlist.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SongCard;
