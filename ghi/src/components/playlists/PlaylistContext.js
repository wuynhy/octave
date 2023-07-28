// Context.js
import React from "react";

export const PlaylistContext = React.createContext();

export const PlaylistProvider = ({ children }) => {
  const [selectedPlaylist, setSelectedPlaylist] = React.useState(null);

  return (
    <PlaylistContext.Provider value={{ selectedPlaylist, setSelectedPlaylist }}>
      {children}
    </PlaylistContext.Provider>
  );
};
