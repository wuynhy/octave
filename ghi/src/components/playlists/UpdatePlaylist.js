import React, { useState, useEffect, useCallback } from "react";
import useToken from "@galvanize-inc/jwtdown-for-react";

export default function UpdatePlaylist({ playlistId }) {
  const { token } = useToken();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [, setPlaylist] = useState([])

  const fetchPlaylist = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}/playlists/${playlistId}`
      );
      if (response.ok) {
        const data = await response.json();
        setPlaylist(data);
      } else {
        console.log("Failed to fetch playlist");
      }
    } catch (error) {
      console.log("Error fetching playlist:", error.message);
    }
  }, [playlistId]);

  useEffect(() => {
    fetchPlaylist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (coverFile) {
      formData.append("cover", coverFile);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}/playlists/${playlistId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        console.log(response);
      } else {
        throw new Error("Failed to update playlist");
      }
    } catch (error) {
      console.error("Error updating playlist:", error);
    }
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
          style={{ backgroundColor: "#374151" }}
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
          accept="image/png, image/jpeg, image/jpg"
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
