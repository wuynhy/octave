import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_HOST}/playlists`)
      .then((response) => response.json())
      .then((data) => setPlaylists(data))
      .catch((error) => console.error("Error fetching playlists:", error));
  }, []);

  return (
    <div className="min-h-screen p-10 flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-10">
        <h1 className="text-4xl text-white font-bold">Playlists</h1>
        <Link
          to="/create_playlist"
          className="flex justify-center bg-purple-700 hover:bg-purple-900 text-gray-100 p-3 rounded-md tracking-wide font-medium shadow-lg cursor-pointer transition ease-in duration-500 text-base"
        >
          + Create playlist
        </Link>
      </div>

      <div className="grid grid-cols-6 gap-1 mt-10 w-full">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="flex flex-col items-center w-40 h-42 rounded-lg relative transform transition duration-500 hover:scale-110 hover:rotate-6 hover:brightness-150 hover:shadow-2xl bg-gray-600 p-5"
          >
            <div className="absolute w-44 h-40 rounded-lg bg-purple-500 opacity-30 shadow-10x2 transition-colors duration-500 hover:bg-purple-300 hover:opacity-50"></div>
            <Link to={`/playlists/${playlist.id}`}>
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
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playlists;
