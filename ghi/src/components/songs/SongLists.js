import React, { useEffect, useState } from "react";
import SongCard from "../Musicplayer/SongCard";

function SongsList({ username }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { error } = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_HOST}/songs`);
        const songsData = await response.json();
        const userSongs = songsData.filter(
          (song) => song.uploader === username
        );
        setSongs(userSongs);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch songs", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [username]);


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : songs.length === 0 ? (
        <p>No songs available.</p>
      ) : (
        <div className="flex flex-wrap sm:justify-start justify-center gap-8">
          {songs.map((song, index) => (
            <SongCard key={song.id} song={song} allSongs={songs} i={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SongsList;
