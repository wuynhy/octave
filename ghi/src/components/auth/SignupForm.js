import { useState } from "react";
import useToken from "@galvanize-inc/jwtdown-for-react";
import { useNavigate } from "react-router-dom";
import { VscEyeClosed, VscEye } from "react-icons/vsc";

const SignupForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [show, setShow] = useState(false);
  const { register } = useToken();
  const navigate = useNavigate();

  const handleRegistration = async (e) => {
    e.preventDefault();
    const accountData = {
      username: username,
      password: password,
      email: email,
      bio: "",
      avatar: "",
    };
    register(accountData, `${process.env.REACT_APP_API_HOST}/signup`);
    e.target.reset();
    navigate("/login");
  };

  const toggle = () => {
    setShow(!show);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  return (
    <div className="min-h-screen sm:flex sm:flex-row mx-0 justify-center">
      <div className="flex-col flex self-center p-10 sm:max-w-5xl xl:max-w-2xl z-10">
        <div className="self-start hidden lg:flex flex-col text-white">
          <img
            src="https://myoctavebucket.s3.us-west-1.amazonaws.com/20230621_002249_0000-removebg-preview.png"
            style={{ height: "500px", width: "500px" }}
            className="mb-3"
            alt="logo"
          />
        </div>
      </div>
      <div className="flex justify-center self-center z-10">
        <div className="p-12 bg-white mx-auto rounded-2xl w-100 ">
          <div className="mb-4">
            <h3 className="font-semibold text-2xl text-gray-800">Sign Up </h3>
          </div>
          <form onSubmit={(e) => handleRegistration(e)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 tracking-wide">
                Email
              </label>
              <input
                className="w-full text-base px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-400"
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 tracking-wide">
                Username
              </label>
              <input
                className="w-full text-base px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-400"
                type="username"
                placeholder="Username"
                value={username}
                onChange={handleUsernameChange}
              />
            </div>
            <div className="space-y-2">
              <label className="mb-5 text-sm font-medium text-gray-700 tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full content-center text-base px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-400 pr-10"
                  type={show === false ? "password" : "text"}
                  name="password"
                  id="password"
                  placeholder="********"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {show === false ? (
                    <VscEyeClosed onClick={toggle} />
                  ) : (
                    <VscEye onClick={toggle} />
                  )}
                </div>
              </div>
            </div>
            <div className="text-sm">
              <a
                href="/login"
                className="text-purple-600 hover:text-purple-800"
              >
                Log In here
              </a>
            </div>
            <div>
              <button
                value="Register"
                type="submit"
                className="w-full flex justify-center bg-purple-700 hover:bg-purple-900 text-gray-100 p-3  rounded-full tracking-wide font-semibold  shadow-lg cursor-pointer transition ease-in duration-500"
              >
                Sign Up
              </button>
            </div>
          </form>
          <div className="pt-5 text-center text-gray-400 text-xs">
            <span>Copyright © 2023 Octave</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
