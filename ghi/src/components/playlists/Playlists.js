import React, { useState, useEffect, useCallback } from "react";

const Playlists = ({ handlePlaylistClick, username }) => {
  const [playlists, setPlaylists] = useState([]);

  const fetchPlaylists = useCallback(async () => {
    const response = await fetch(`${process.env.REACT_APP_API_HOST}/playlists`);
    const data = await response.json();
    const userPlaylists = data.filter(
      (playlist) => playlist.owner === username
    );
    setPlaylists(userPlaylists);
  }, [username]);

  useEffect(() => {
    fetchPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return playlists.length === 0 ? (
    <p>No playlists available.</p>
  ) : (
    <div className="flex flex-row flex-wrap justify-center animate-slideup">
      {playlists.map((playlist) => (
        <div
          key={playlist.id}
          className="flex flex-col items-center w-40 h-42 rounded-lg relative transform transition duration-500 hover:scale-110 hover:rotate-6 hover:brightness-150 hover:shadow-2xl bg-gray-600 p-5 m-4 cursor-pointer"
          onClick={() => handlePlaylistClick(playlist)}
        >
          <div className="w-40 h-40 flex items-center justify-center overflow-hidden rounded-lg">
            <img
              className="w-full h-full object-cover z-20 transition duration-500 hover:opacity-50"
              src={playlist.cover_url}
              alt={playlist.name}
            />
          </div>
          <p className="text-white text-lg font-semibold text-center mt-2">
            {playlist.name}
          </p>
        </div>
      ))}
    </div>
  );
  };
  export default Playlists;
