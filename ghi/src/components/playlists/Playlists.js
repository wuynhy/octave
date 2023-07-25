import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/playlists")
      .then((response) => response.json())
      .then((data) => setPlaylists(data))
      .catch((error) => console.error("Error fetching playlists:", error));
  }, []);

  return (
    <div className="bg-black min-h-screen p-10 flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-10">
        <h1 className="text-4xl text-white font-bold">Playlists</h1>
        <Link
          to="/create_playlist"
          className="flex justify-center bg-purple-700 hover:bg-purple-900 text-gray-100 p-3 rounded-md tracking-wide font-medium shadow-lg cursor-pointer transition ease-in duration-500 text-base"
        >
          + Create playlist
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-10 mt-10 w-full">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="flex flex-col items-center w-45 h-58 rounded-lg relative transform transition duration-500 hover:scale-110 hover:rotate-6 hover:brightness-150 hover:shadow-2xl bg-gray-800 p-5"
          >
            <div className="absolute w-33 h-33 rounded-lg shadow-10x2 transition-colors duration-500 hover:bg-purple-700"></div>
            <Link to={`/playlists/${playlist.id}`}>
              <img
                className="w-32 h-32 object-cover rounded-lg z-20 transition duration-500 hover:opacity-50"
                src={playlist.cover_url}
                alt={playlist.name}
              />
              <p className="text-white text-lg font-semibold text-center mt-2">
                {playlist.name}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>

  );
};

export default Playlists;
