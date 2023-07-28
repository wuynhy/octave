import React, { useState } from "react";
import useToken from "@galvanize-inc/jwtdown-for-react";

export default function CreatePlaylist() {
  const { token } = useToken();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState(null);

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
    setIsLoading(true);
    setErrorMessages(null);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("cover", coverFile);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}/playlists`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
          credentials: "include",
        }
      );

      if (response.ok) {
        await response.json();
        setName("");
        setDescription("");
        setCoverFile(null);

        const closeBtn = document.querySelector(".modal .btn-ghost");
        if (closeBtn) {
          closeBtn.click();
        }
      } else {
        console.log("Failed to create playlist");
      }
    } catch (error) {
      console.log("Error creating playlist:", error.message);
      setErrorMessages("Failed to create playlist, please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg bg-transparent shadow-md rounded px-8 pt-6 pb-8 mb-4 center-form"
    >
      <h2 className="font-semibold text-xl text-white">Create Playlist</h2>
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full px-3">
          <label className="block text-md mb-2 text-white" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
            className="mb-5 w-full px-3 py-2 text-md text-black bg-gray-50 border border-gray-600 rounded"
            required
          />

          <label
            className="block text-md mb-2 text-white"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            className="mb-5 w-full px-3 py-2 text-md text-black bg-gray-50 border border-gray-600 rounded"
            required
          ></textarea>

          <label className="block text-md mb-2 text-white" htmlFor="cover">
            Cover Image
          </label>
          <input
            type="file"
            id="cover"
            onChange={handleCoverFileChange}
            className="mb-5 w-full px-3 py-2 text-md text-gray-50 bg-gray-760 border border-gray-600 rounded"
          />
          <div className="w-full px-3 mt-6">
            {errorMessages && <p className="text-red-500">{errorMessages}</p>}
            <button
              disabled={isLoading}
              type="submit"
              className="w-full flex justify-center bg-purple-700 hover:bg-purple-900 text-gray-100 p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-500"
            >
              {isLoading ? (
                <span className="loading loading-dots loading-md"></span>
              ) : (
                "Create Playlist"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
