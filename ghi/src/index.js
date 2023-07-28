import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import MusicPlayer from "./components/Musicplayer";
import { SearchProvider } from "./components/search/SearchContext";
import { PlaylistProvider } from "./components/playlists/PlaylistContext";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <SearchProvider>
        <PlaylistProvider>
        <App />
        <MusicPlayer />
        </PlaylistProvider>
      </SearchProvider>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
