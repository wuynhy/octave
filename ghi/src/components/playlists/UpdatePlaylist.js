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
    const fetchPlaylist = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_HOST}/playlists/${playlistId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch playlist");
        }
        const playlistData = await response.json();
        setName(playlistData.name);
        setDescription(playlistData.description);
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    };

    fetchPlaylist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistId]);

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
        navigate(`/playlists/${playlistId}`);
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
