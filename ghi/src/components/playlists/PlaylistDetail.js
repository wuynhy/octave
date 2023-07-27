import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useToken from "@galvanize-inc/jwtdown-for-react";
import { useCallback } from "react";

export default function PlaylistDetail() {
  const { token } = useToken();
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();
  const [allPlaylists, setAllPlaylists] = useState([]);

  const fetchAllPlaylists = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}/playlists`
      );
      if (response.ok) {
        const data = await response.json();
        setAllPlaylists(data);
      } else {
        console.log("Failed to fetch all playlists");
      }
    } catch (error) {
      console.log("Error fetching all playlists:", error.message);
    }
  }, []);

  useEffect(() => {
    fetchAllPlaylists();
  }, [fetchAllPlaylists]);



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
  }, [fetchPlaylist]);

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
        console.log(`Playlist with id: ${playlistId} was deleted.`);
        navigate("/playlists");
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

  const searchSongs = async () => {
    console.log(`Search term: ${searchTerm}`);
    const requestUrl = `${
      process.env.REACT_APP_API_HOST
    }/songs?title=${encodeURIComponent(searchTerm)}`;
    console.log(`Request URL: ${requestUrl}`);

    try {
      const response = await fetch(requestUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const songs = await response.json();
        setSearchResults(songs);

        console.log("Search results:", songs);
      } else {
        console.log("Song search failed.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  async function addSongToPlaylist(songId) {
    console.log("addSongToPlaylist function called with songId:", songId); // log the songId passed to function
    console.log("Current playlistId state:", playlistId); // log the playlistId state

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
        console.log(`Song with id: ${songId} was added to the playlist.`);
        fetchPlaylist();
      } else {
        console.log("Song could not be added to the playlist.");
      }
    } catch (error) {
      console.error("Error:", error);

      console.log(`Song with id: ${songId} was added to the playlist.`);
      // Reload playlist songs after adding a new one
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

 return (
      <div className="min-h-screen p-12 flex flex-col items-center">
      <div className="bg-gradient-to-b from-slate-800 via-slate-500 via-gray-400 to-slate-300 w-full rounded-lg p-8">

      <div className="flex justify-between items-start mb-5">
        {playlist && (
          <>
            <div className="flex items-center">
              <div className="flex justify-center items-center bg-slate-700 rounded w-1/8 h-1/8 shadow-lg">
                <Link to={`/playlists/${playlist.id}`}>
                  <img
                    className="w-64 h-64 mb-2 object-cover rounded shadow-2xl"
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
                    <Link
                      to={`/update-playlist/${playlistId}`}
                      className="block px-4 py-2 text-sm hover:bg-gray-600"
                    >
                      Update Playlist
                    </Link>
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
                      onClick={() => setModalVisible(true)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-600"
                    >
                      Add Songs
                    </button>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/playlists"
                      className="block px-4 py-2 text-sm hover:bg-gray-600"
                    >
                      Back to Playlists
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {modalVisible && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div
              className="inline-block align-bottom bg-gray-200 text-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-800 text-white rounded p-2 w-full"
                    />
                    <button
                      onClick={searchSongs}
                      className="bg-green-500 hover:bg-green-600 text-white rounded p-2 mt-2 w-full"
                    >
                      Search
                    </button>
                  </div>
                </div>
                {searchResults.length > 0 && (
                  <div>
                    {searchResults.map((song) => (
                      <div
                        key={song.id}
                        className="flex justify-between items-center p-2 rounded transition-colors duration-200 hover:bg-gray-800"
                      >
                        <p>{song.title}</p>
                        <button
                          onClick={() => {
                            console.log(
                              "Add song button clicked for songId:",
                              song.id
                            );
                            addSongToPlaylist(song.id);
                          }}
                          className="text-xs py-1 px-2 bg-green-500 hover:bg-green-600 text-white rounded cursor-pointer"
                        >
                          Add Song
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setModalVisible(false)}
                >
                  Close
                </button>
                <div
                  style={{
                    minHeight: '80px', // Adjust this to the minimum height you want for the container
                    maxHeight: '500px', // Adjust this to the maximum height you want for the container
                    overflowY: 'auto'
                  }}
                >
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
          </div>
        </div>
      )}

    <div className="justify-content-center border border-gray-800 p-2 rounded-lg bg-gradient-to-t from-slate-900 to-gray-500 flex flex-col w-full shadow-inner">
  <div className="flex flex-grow">
    {playlist && playlist.songs && playlist.songs.length > 0 ? (
      <div className="w-3/4 mr-4">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="border px-2 py-2 text-lg font-semibold text-left">#</th>
              <th className="border px-2 py-2 text-lg font-semibold text-left">Cover</th>
              <th className="border px-2 py-2 text-lg font-semibold text-left">Title</th>
              <th className="border px-2 py-2 text-lg font-semibold text-left">Artist</th>
              <th className="border px-2 py-2 text-lg font-semibold text-left">Music File</th>
              <th className="border px-2 py-2 text-lg font-semibold text-left">
                <div style={{ fontFamily: "Montserrat, sans-serif" }}>Duration</div>
              </th>
            </tr>
          </thead>
          <tbody className="space-y-4">
           {playlist.songs.map((song, index) => (
    <tr key={index} className="py-12">
      <td className="border px-2 py-2 text-lg p-1 leading-1">{index + 1}</td>
      <td className="border px-2 py-2">
        <img
          className="w-12 h-10 object-cover rounded"
          src={playlist.covers[index]}
          alt={`Cover for ${song}`}
        />
      </td>
      <td className="border px-2 py-2">
        <ol style={{ margin: 0, padding: 0 }}>
          <li style={{ marginBottom: "10px" }}>{song}</li>
        </ol>
      </td>
      <td className="border px-2 py-2 text-lg">{playlist.artists[index]}</td>
      <td className="border px-2 py-2">
        <audio controls>
          <source src={playlist.music_files[index]} type="audio/mpeg" />
        </audio>
      </td>
      <td className="border px-2 py-2 text-lg">{formatDuration(playlist.durations[index])}</td>
    </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p>No songs in this playlist yet.</p>
    )}
    <div className="w-1/8 bg-gray-800">
      {playlist && playlist.songs && playlist.songs.length > 0 ? (
        playlist.songs.map((song, index) => (
          <div key={index} className="w-full bg-gray-800">
            <img

              src={playlist.covers[index]}
              alt={`Cover for ${song.title}`}
              className="w-40 h-40 p-4 object-cover"
            />
          </div>
        ))
      ) : null

      }
    </div>
  </div>
<div className="w-full flex overflow-x-scroll py-2 border" style={{ scrollbarWidth: "none" }}>
  {allPlaylists.map((pl) => (
    <div
      key={pl.id}
      className="shadow-lg flex-shrink-0 w-48 h-48 mr-2 border-2 transform transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:bg-white hover:bg-opacity-20"
    >
      <Link to={`/playlists/${pl.id}`}>
        <img
          className="shadow-lg object-cover w-full h-2/3 rounded"
          src={pl.cover_url}
          alt={pl.name}
        />
        <p className="text-center text-white">{pl.name}</p>
      </Link>
    </div>
  ))}
</div>

</div>
</div>

</div>
  );
}
