import React from "react";

const Track = ({ isPlaying, isActive, activeSong }) => {
  const transparentImage =
    "https://cdn.saleminteractivemedia.com/shared/images/default-cover-art.png";

  return (
    <div className="flex-1 flex items-center justify-start">
      <div
        className={`${
          isPlaying && isActive ? "animate-spin duration-3000" : ""
        } hidden sm:block h-16 w-16 mr-4 rounded-full overflow-hidden`}
      >
        <img
          src={activeSong?.cover_url || transparentImage}
          alt="cover art"
          className="w-full h-full object-cover"
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
