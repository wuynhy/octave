import React, { useState, useEffect, useRef } from "react";
import useToken from "@galvanize-inc/jwtdown-for-react";
import "./profile.css";
import { useParams } from "react-router";

function EditProfile() {
  const [userData, setUserData] = useState({});
  const [avatar, setAvatar] = useState(null);
  const { username } = useParams();
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useToken();
  const avatarRef = useRef();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_HOST}/users/${username}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const userData = await response.json();
          console.log(userData);
          setUserData(userData);
          setBio(userData.bio || "");
          setEmail(userData.email);
          setAvatar(userData.avatar_url);
          setUsername(userData.username || "");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchUserData();
  }, [username, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("username", userName);
    formData.append("password", password);
    if (avatarRef.current.files.length > 0) {
      formData.append(
        "avatar",
        avatarRef.current.files[0],
        avatarRef.current.files[0].name
      );
    }
    formData.append("bio", bio);
    formData.append("email", email);

    for (let pair of formData.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}/users/${username}`,
        {
          method: "PUT",
          body: formData,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        setIsLoading(false);
        const closeBtn = document.querySelector(".modal .btn-ghost");
        if (closeBtn) {
          closeBtn.click();
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error:", error);
    }
  };

  return (
    <form
      id="edit-profile-form"
      className="w-full max-w-lg bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 center-form"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="username"
          >
            Username
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="username"
            type="text"
            value={userName}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>
        <div className="w-full px-3 mt-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="avatar"
          >
            Avatar (jpg, jpeg, png only)
          </label>
          <input
            ref={avatarRef}
            className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="avatar"
            name="avatar"
            type="file"
            onChange={(event) => {
              if (event.target.files && event.target.files.length > 0) {
                setAvatar(event.target.files[0]);
              }
            }}
          />
        </div>
        <div className="w-full px-3 mt-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="bio"
          >
            Bio
          </label>
          <textarea
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="bio"
            name="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Enter bio"
          />
        </div>
        <div className="w-full px-3 mt-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter email"
            required
          />
        </div>
        <div className="w-full px-3 mt-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter new password"
          />
        </div>
        <div className="w-full px-3 mt-3">
          <button
            type="submit"
            className="w-full shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default EditProfile;
