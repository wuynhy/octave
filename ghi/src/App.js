import React from "react";
import { AuthProvider } from "@galvanize-inc/jwtdown-for-react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";
import Home from "./page/Home";
import PrivateRoutes from "./utils/PrivateRoutes";
import ChatRoom from "./components/chat/ChatRoom";
import Stage from "./Stage";
import Main from "./page/Main";
import ProfilePage from "./components/profile/ProfilePage";
import SidebarLeft from "./components/nav/Nav";
import EditProfile from "./components/profile/EditProfile";
import Playlists from "./components/playlists/Playlists";
import PlaylistDetail from "./components/playlists/PlaylistDetail";
import CreatePlaylist from "./components/playlists/CreatePlaylist";
import UpdatePlaylist from "./components/playlists/UpdatePlaylist";
import SearchBar from "./SearchBar";

function App() {
  const baseUrl = process.env.REACT_APP_API_HOST;
  const domain = /https:\/\/[^/]+/;
  const basename = process.env.PUBLIC_URL.replace(domain, "");

  const StageChat = () => {
    return (
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1.5 }}>
          <Stage />
        </div>
        <div style={{ flex: 0.5 }}>
          <ChatRoom />
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <BrowserRouter basename={basename}>
        <AuthProvider baseUrl={baseUrl}>
          <Routes>
            <Route exact path="/" element={<Main />} />
            <Route exact path="/search" element={<SearchBar />} />
            <Route exact path="/signup" element={<SignupForm />} />
            <Route exact path="/login" element={<LoginForm />} />

            <Route
              element={
                <div style={{ display: "flex" }}>
                  <SidebarLeft />
                  <div style={{ flex: 1 }}>
                    <PrivateRoutes />
                  </div>
                </div>
              }
            >
              <Route exact path="/home" element={<Home />} />
              <Route path="/stages/:id" element={<StageChat />} />
              <Route
                exact
                path="/profile/:username"
                element={<ProfilePage />}
              />
              <Route
                exact
                path="/profile/:username/edit"
                element={<EditProfile />}
              />
              <Route path="/playlists/" element={<Playlists />} />
              <Route
                path="/playlists/:playlistId"
                element={<PlaylistDetail />}
              />
              <Route path="/create_playlist" element={<CreatePlaylist />} />
              <Route
                path="/update-playlist/:playlistId"
                element={<UpdatePlaylist />}
              />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
