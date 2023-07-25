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
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
