import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useToken from "@galvanize-inc/jwtdown-for-react";

export default function PlaylistDetail() {
  const { token } = useToken();
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylist = async () => {
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
    };

    fetchPlaylist();
  }, [playlistId]);

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

  return (
    <div className="bg-black text-white min-h-screen p-10 font-sans">
      <div className="border border-gray-800 p-4 rounded-lg mb-6 bg-gray-800">
        <div className="controlBar flex justify-between">
          <Link
            to={`/update-playlist/${playlistId}`}
            className="px-2 py-1 bg-blue-500 hover:bg-purple-600 text-white text-xs font-medium tracking-wider rounded-md shadow-sm transition-colors duration-200"
          >
            Update Playlist
          </Link>
          <button
            onClick={deletePlaylist}
            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium tracking-wider rounded-md shadow-sm transition-colors duration-200"
          >
            Delete Playlist
          </button>
        </div>

        <div className="flex justify-start items-start mb-5">
          {playlist && (
            <>
              <div className="flex justify-center items-center bg-gray-900 rounded w-72 h-72">
                <Link to={`/playlists/${playlist.id}`}>
                  <img
                    className="w-64 h-64 mb-2 object-cover rounded"
                    src={playlist.cover_url}
                    alt={playlist.name}
                  />
                </Link>
              </div>
              <div className="ml-5">
                <h1 className="text-4xl mb-5 font-semibold">{playlist.name}</h1>
                <p className="text-base font-bold">{playlist.description}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="border border-gray-800 p-4 rounded-lg bg-gray-800">
        {playlist && playlist.songs && playlist.songs.length > 0 ? (
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th className="border px-2 py-2 text-lg font-semibold text-left">
                  #
                </th>
                <th className="border px-2 py-2 text-lg font-semibold text-left">
                  Cover
                </th>
                <th className="border px-2 py-2 text-lg font-semibold text-left">
                  Title
                </th>
                <th className="border px-2 py-2 text-lg font-semibold text-left">
                  Artist
                </th>
                <th className="border px-2 py-2 text-lg font-semibold text-left">
                  Music File
                </th>
                <th className="border px-2 py-2 text-lg font-semibold text-left">
                  <div style={{ fontFamily: "Montserrat, sans-serif" }}>
                    Duration
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {playlist.songs.map((song, index) => (
                <tr key={index}>
                  <td className="border px-2 py-2 text-lg">{index + 1}</td>
                  <td className="border px-2 py-2">
                    <img
                      className="w-10 h-10 object-cover rounded"
                      src={playlist.covers[index]}
                      alt={`Cover for ${song}`}
                    />
                  </td>
                  <td className="border px-2 py-2">
                    <ol style={{ margin: 0, padding: 0 }}>
                      <li style={{ marginBottom: "10px" }}>{song}</li>
                    </ol>
                  </td>
                  <td className="border px-2 py-2 text-lg">
                    {playlist.artists[index]}
                  </td>
                  <td className="border px-2 py-2">
                    <audio controls>
                      <source
                        src={playlist.music_files[index]}
                        type="audio/mpeg"
                      />
                      Your browser does not support the audio element.
                    </audio>
                  </td>
                  <td className="border px-2 py-2 text-lg">
                    {formatDuration(playlist.durations[index])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-lg">No songs in the playlist yet.</div>
        )}
      </div>
    </div>
  );
}