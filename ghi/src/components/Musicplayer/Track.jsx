import React from "react";

const Track = ({ isPlaying, isActive, activeSong }) => {
  // Transparent 1x1 pixel image in base64 format
  const transparentImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/+x9GEkAAAAASUVORK5CYII=";

  return (
    <div className="flex-1 flex items-center justify-start">
      <div
        className={`${
          isPlaying && isActive ? "animate-spin duration-3000" : ""
        } hidden sm:block h-16 w-16 mr-4`}
      >
        <img
          src={activeSong?.cover_url || transparentImage}
          alt="cover art"
          className="rounded-full"
          onError={(e) => (e.target.src = transparentImage)}
        />
      </div>
      <div className="w-[50%]">
        <p className="truncate text-white font-bold text-lg">
          {activeSong?.title ? activeSong?.title : "No active Song"}
        </p>
        <p className="truncate text-gray-300">
          {activeSong?.artist ? activeSong?.artist : "No active Song"}
        </p>
      </div>
    </div>
  );
};

export default Track;
