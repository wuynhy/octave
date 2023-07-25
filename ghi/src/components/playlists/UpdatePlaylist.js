import React, { useState, useEffect } from "react";
import useToken from "@galvanize-inc/jwtdown-for-react";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdatePlaylist() {
  const { token } = useToken();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const navigate = useNavigate();
  const { playlistId } = useParams();

  useEffect(() => {
    const fetchPlaylist = async () => {};

    fetchPlaylist();
  }, [token, playlistId]);

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
    //...
  };

  return (
    <div className="flex items-center justify-center bg-black min-h-screen p-10">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-10 rounded-lg shadow-xl max-w-md"
      >
        <h1 className="font-bold text-3xl mb-5 text-center text-white">
          Update Playlist
        </h1>

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
          Update Playlist
        </button>
      </form>
    </div>
  );
}
