import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import PlayPause from "./PlayPause";
import { playPause, setActiveSong } from "../redux/features/playerSlice";
import { useGetSongByIdQuery } from "../redux/services/musicPlayerApi";

const SongCard = ({ song, isPlaying, activeSong, allSongs, i }) => {
  const dispatch = useDispatch();
  const { data: detailedSong } = useGetSongByIdQuery(song.id, {
    skip: !activeSong,
  });

  const songIndex = allSongs.findIndex((s) => s.id === song.id);

  const handleSongClick = () => {
    console.log("Active Song:", activeSong);
    console.log("Current Song ID:", song.id);
    if (!isPlaying || (activeSong && activeSong.id !== song.id)) {
      handlePlayClick();
    } else {
      handlePauseClick();
    }
  };

  const handlePauseClick = () => {
    console.log("Pause clicked!");
    dispatch(playPause(false));
  };

  const handlePlayClick = () => {
    console.log("Play clicked!");
    const nextSong =
      songIndex < allSongs.length - 1 ? allSongs[songIndex + 1] : allSongs[0];
    const prevSong =
      songIndex > 0 ? allSongs[songIndex - 1] : allSongs[allSongs.length - 1];

    dispatch(
      setActiveSong({
        song: detailedSong || song,
        data: allSongs,
        i: songIndex,
      })
    );
    dispatch(playPause(true));
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
        <p className="text-sm truncate text-gray-300 mt-1">
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
      <div className="mt-2">
        <button
          className="text-xs bg-indigo-600 text-white rounded px-2 py-1"
          onClick={(e) => {
            e.stopPropagation(); // Prevent the song from playing or pausing when this button is clicked
            console.log(`Add song ${song.id} to playlist`);
          }}
        >
          Add to Playlist
        </button>
      </div>
    </div>
  );
};

export default SongCard;
