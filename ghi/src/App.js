import { AuthProvider } from "@galvanize-inc/jwtdown-for-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";
import Home from "./page/Home";
import PrivateRoutes from "./utils/PrivateRoutes";
import ChatRoom from "./components/chat/ChatRoom";
import Stage from "./Stage";
import Main from "./page/Main";
import ProfilePage from "./components/profile/ProfilePage";

function App() {
  const domain = /https:\/\/[^/]+/;
  const basename = process.env.PUBLIC_URL.replace(domain, "");
  const baseUrl = process.env.REACT_APP_API_HOST;

  const StageChatContainer = () => {
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
            <Route exact path="/" element={<Main />}></Route>
            <Route exact path="/signup" element={<SignupForm />}></Route>
            <Route exact path="/login" element={<LoginForm />}></Route>
            <Route element={<PrivateRoutes />}>
              <Route exact path="/home" element={<Home />}></Route>
              <Route path="/stages/:id" element={<StageChatContainer />} />
              {/* <Route exact path="/songs" element={<ListSongs />}></Route> */}
              {/* <Route exact path="/songs/upload" element={<UploadSong />}></Route> */}
              <Route
                exact
                path="/profile/:username"
                element={<ProfilePage />}
              ></Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
