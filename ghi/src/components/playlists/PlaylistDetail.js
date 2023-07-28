import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useToken from "@galvanize-inc/jwtdown-for-react";
import { useCallback } from "react";
import UpdatePlaylist from "./UpdatePlaylist";
import { PlaylistContext } from "./PlaylistContext";

export default function PlaylistDetail({ onBack, playlistId }) {
  const { token } = useToken();
  const [playlist, setPlaylist] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playlistSongs] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const { setSelectedPlaylist } = React.useContext(PlaylistContext);

  const fetchPlaylist = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}/playlists/${playlistId}`
      );
      if (response.ok) {
        const data = await response.json();
        setPlaylist(data);
      } else {
        console.log("Failed to fetch playlist");
      }
    } catch (error) {
      console.log("Error fetching playlist:", error.message);
    }
  }, [playlistId]);

  useEffect(() => {
    fetchPlaylist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deletePlaylist = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}/playlists/${playlistId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setSelectedPlaylist(null);
      } else {
        console.log("Playlist could not be deleted.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const formatDuration = (durationInSeconds) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const searchSongs = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_HOST}/songs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const songs = await response.json();
        const filteredSongs = songs.filter(
          (song) =>
            song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filteredSongs);
      } else {
        console.log("Failed to fetch songs.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }, [searchTerm, token]);
  
  useEffect(() => {
    if (searchTerm !== "") {
      searchSongs();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, searchSongs]);

  async function addSongToPlaylist(songId) {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}/playlists/${playlistId}/add_song/${songId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        fetchPlaylist();
      } else {
        console.log("Song could not be added to the playlist.");
      }
    } catch (error) {
      console.error("Error:", error);
      fetchPlaylist();
    }
  }
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const removeSongFromPlaylist = async (songName) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}/playlists/${playlistId}/remove_song/${songName}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        fetchPlaylist();
      } else {
        console.log("Song could not be removed from the playlist.");
      }
    } catch (error) {
      console.error("Error:", error);
      fetchPlaylist();
    }
  };

  return (
    <div className="bg-black text-white min-h-screen p-10 font-sans">
      <div className="flex justify-between items-start mb-5">
        {playlist && (
          <>
            <div className="flex items-center">
              <div className="flex justify-center items-center bg-gray-900 rounded w-64 h-64">
                <Link to={`/playlists/${playlist.id}`}>
                  <img
                    className="w-52 h-52 mb-2 object-cover rounded"
                    src={playlist.cover_url}
                    alt={playlist.name}
                  />
                </Link>
              </div>
              <div className="ml-5">
                <h1 className="text-4xl mb-5 font-semibold">{playlist.name}</h1>
                <p className="text-base font-bold">{playlist.description}</p>
              </div>
            </div>

            <div className="relative inline-block text-left">
              <button
                className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-800 hover:bg-gray-700 hover:scale-105 hover:shadow-lg focus:outline-none transition duration-150"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-6 w-6 text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 divide-y divide-gray-600 text-gray-300"
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUpdateModalVisible(true);
                        setModalVisible(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-600"
                    >
                      Update Playlist
                    </button>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={deletePlaylist}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-600"
                    >
                      Delete Playlist
                    </button>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUpdateModalVisible(false);
                        setModalVisible(true);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-600"
                    >
                      Add Songs
                    </button>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={onBack}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-600"
                    >
                      Back To Playlists
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {updateModalVisible && (
        <div className="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center pb-20">
          <div className="bg-gray-200 text-black rounded-lg shadow-xl transform transition-all sm:max-w-lg sm:w-full relative">
            <button
              onClick={() => setUpdateModalVisible(false)}
              className="absolute top-0 right-0 mt-3 mr-2 hover:bg-red-600 text-white rounded-full p-2"
            >
              X
            </button>
            <UpdatePlaylist />
          </div>
        </div>
      )}

      {modalVisible && (
        <div className="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center pb-20">
          <div
            className="bg-gray-200 text-black rounded-lg shadow-xl transform transition-all sm:max-w-lg sm:w-full"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <div className="flex">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-800 text-black rounded p-2 flex-1 mr-2"
                    />
                    <button
                      onClick={searchSongs}
                      className="bg-pink-500 hover:bg-pink-600 text-white rounded p-2"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
              {searchResults.length > 0 && (
                <div>
                  {searchResults.map((song) => (
                    <div
                      key={song.id}
                      className="flex justify-between items-center p-2 rounded transition-colors duration-200 hover:bg-gray-400"
                    >
                      <div className="flex-grow">
                        <p className="font-bold">{song.title}</p>
                        <p className="text-sm text-gray-500">{song.artist}</p>
                      </div>
                      <button
                        onClick={() => {
                          addSongToPlaylist(song.id);
                        }}
                        className="text-xs py-1 px-2 bg-pink-500 hover:bg-pink-600 text-white rounded cursor-pointer"
                      >
                        Add Song
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-gray-400 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-pink-500 text-base font-medium text-white hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setModalVisible(false)}
              >
                Close
              </button>
              {playlistSongs.length > 0 &&
                playlistSongs.map((song) => (
                  <div key={song.id}>
                    <h2>{song.title}</h2>
                    <p>{formatDuration(song.duration)}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
      <div className="border border-gray-800 p-4 rounded-lg bg-gray-800 flex">
        {playlist && playlist.songs && playlist.songs.length > 0 ? (
          <div className="w-3/4 mr-4">
            <table className="table-auto w-full text-center">
              <thead className="text-center">
                <tr>
                  <th className="border px-2 py-2 text-lg font-semibold"></th>
                  <th className="border px-2 py-2 text-lg font-semibold">
                    Cover
                  </th>
                  <th className="border px-2 py-2 text-lg font-semibold">
                    Title
                  </th>
                  <th className="border px-2 py-2 text-lg font-semibold">
                    Artist
                  </th>
                  <th className="border px-2 py-2 text-lg font-semibold">
                    <div style={{ fontFamily: "Montserrat, sans-serif" }}>
                      Duration
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {playlist.songs.map((song, index) => (
                  <tr key={index}>
                    <td className="border px-2 py-2 text-lg align-middle">
                      {index + 1}
                    </td>
                    <td className="border px-2 py-2 flex justify-center items-center">
                      <img
                        className="w-14 h-14 object-cover rounded align-middle"
                        src={playlist.covers[index]}
                        alt={`Cover for ${song}`}
                      />
                    </td>
                    <td className="border px-2 py-2 text-lg align-middle">
                      <ol style={{ margin: 0, padding: 0 }}>
                        <li style={{ marginBottom: "10px" }}>{song}</li>
                      </ol>
                    </td>
                    <td className="border px-2 py-2 text-lg align-middle">
                      {playlist.artists[index]}
                    </td>
                    <td className="border px-2 py-2 text-lg align-middle">
                      {formatDuration(playlist.durations[index])}
                    </td>
                    <td className="border px-2 py-2 text-lg align-middle text-right">
                      <button
                        onClick={() => removeSongFromPlaylist(song)}
                        className="text-xs py-1 px-2 border border-pink-500 text-pink-500 hover:text-white hover:bg-pink-500 rounded cursor-pointer"
                      >
                        Remove Song
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No songs in this playlist yet.</p>
        )}
      </div>
    </div>
  );
}
