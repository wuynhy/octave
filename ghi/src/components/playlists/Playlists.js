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
    <>
      <div
        className="relative pt-1 mx-auto w-screen text-center text-4x4 font-bold"
        style={{
          minHeight: "100vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          paddingBottom: "150px",
          backgroundImage: `linear-gradient(109.6deg, rgb(48, 35, 174) 11.2%, rgb(200, 109, 215) 100.2%)`,
        }}
      >
        <div className="flex justify-between items-center w-full mb-10">
          <Link
            to="/create_playlist"
            className="flex justify-center bg-purple-800 hover:bg-purple-400 text-gray-100 p-3 rounded-md tracking-wide font-medium shadow-lg cursor-pointer transition ease-in duration-500 text-base"
          >
            + Create playlist
          </Link>
        </div>

        <div className="grid grid-cols-5 gap-10 mt-10 w-full">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="flex flex-col items-center w-30 h-30 rounded-lg relative transform transition duration-500 hover:scale-110 hover:rotate-6 hover:brightness-150 hover:shadow-2xl bg-slate-600 shadow-2xl p-5"
              style={{
                background:
                  "linear-gradient(to bottom right, #3023AE, #C86DD7)",
              }}
            >
              <div className="rounded-lg bg-purple-500 opacity-30 shadow-10x2 transition-colors duration-500 hover:bg-purple-300 hover:opacity-50"></div>
              <Link to={`/playlists/${playlist.id}`}>
                <div className="w-35 h-35 flex items-center justify-center overflow-hidden rounded-lg">
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
    </>
  );
};

export default Playlists;
