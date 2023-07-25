import React, { useState } from "react";
import useToken from "@galvanize-inc/jwtdown-for-react";
import { useNavigate } from "react-router-dom";

export default function CreatePlaylist() {
  const { token } = useToken();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const navigate = useNavigate();

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleCoverFileChange = (event) => {
    setCoverFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("cover", coverFile);

    try {
      const response = await fetch(`http://localhost:8080/playlists`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        console.log("Playlist created");
        navigate("/playlists");
      } else {
        console.log("Failed to create playlist");
      }
    } catch (error) {
      console.log("Error creating playlist:", error.message);
    }
  };

  return (
    <div className="flex items-center justify-center bg-black min-h-screen p-10">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-10 rounded-lg shadow-xl max-w-md"
      >
        <h2 className="font-semibold text-2xl text-white text-center">
          Create Playlist
        </h2>

        <label className="block text-lg mb-2 text-white" htmlFor="name">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={handleNameChange}
          className="mb-5 w-full px-3 py-2 text-lg text-white bg-gray-700 border border-gray-600 rounded"
          required
        />

        <label className="block text-lg mb-2 text-white" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={handleDescriptionChange}
          className="mb-5 w-full px-3 py-2 text-lg text-white bg-gray-700 border border-gray-600 rounded"
          required
        ></textarea>

        <label className="block text-lg mb-2 text-white" htmlFor="cover">
          Cover Image
        </label>
        <input
          type="file"
          id="cover"
          onChange={handleCoverFileChange}
          className="mb-5 w-full px-3 py-2 text-lg text-gray-300 bg-gray-700 border border-gray-600 rounded"
        />

        <button
          type="submit"
          className="w-full flex justify-center bg-purple-700 hover:bg-purple-900 text-gray-100 p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-500"
        >
          Create Playlist
        </button>
      </form>
    </div>
  );
}
