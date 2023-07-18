import "./App.css";
import { AuthProvider } from "@galvanize-inc/jwtdown-for-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";
import Home from "./page/Home";
import PrivateRoutes from "./utils/PrivateRoutes";
import ChatRoom from "./ChatRoom";
import Stage from "./Stage";

function App() {
  const domain = /https:\/\/[^/]+/;
  const basename = process.env.PUBLIC_URL.replace(domain, "");
  const baseUrl = process.env.REACT_APP_API_HOST;

  return (
    <div className="container">
      <BrowserRouter basename={basename}>
        <AuthProvider baseUrl={baseUrl}>
          <Routes>
            <Route exact path="/signup" element={<SignupForm />}></Route>
            <Route exact path="/login" element={<LoginForm />}></Route>
            <Route
              path="/stages/:id"
              element={
                <>
                  <Stage />
                  <ChatRoom />
                </>
              }
            />
            <Route element={<PrivateRoutes />}>
              <Route exact path="/" element={<Home />}></Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
