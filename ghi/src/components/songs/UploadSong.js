import React, { useEffect, useState, useRef } from "react";
import useToken from "@galvanize-inc/jwtdown-for-react";
import "../profile/profile.css";
import Select from "react-select";

function UploadSong() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [musicFile, setMusicFile] = useState(null);
  const [cover, setCover] = useState(null);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectValue, setSelectValue] = useState([]);
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState(null);
  const { token } = useToken();
  const musicFileRef = useRef();
  const coverRef = useRef();

  useEffect(() => {
    const fetchGenres = async () => {
      const response = await fetch(`${process.env.REACT_APP_API_HOST}/genres`);
      const data = await response.json();
      setGenres(data);
    };
    fetchGenres();
  }, []);

  const handleUserData = async () => {
    const url = `${process.env.REACT_APP_API_HOST}/token`;
    fetch(url, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setUser(data);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    handleUserData();
  }, []);

  let user_id = user.user ? user.user.id : null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessages(null);
    const formData = new FormData();
    formData.append("uploader", user_id);
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("music_file", musicFile);
    formData.append("cover", cover);
    formData.append("genres", selectedGenres.join(","));

    for (let pair of formData.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_HOST}/songs`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        await response.json();
        setTitle("");
        setArtist("");
        setMusicFile(null);
        setCover(null);
        setSelectedGenres([]);
        setSelectValue(null);
        musicFileRef.current.value = "";
        coverRef.current.value = "";
        setIsLoading(false);

        const closeBtn = document.querySelector(".modal .btn-ghost");
        if (closeBtn) {
          closeBtn.click();
        }
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      setIsLoading(false);
      setErrorMessages("Failed to upload song, please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <form
      id="upload-form"
      className="w-full max-w-lg bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 center-form"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="title"
          >
            Song Title
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="title"
            type="text"
            value={title}
            name="title"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter song title"
            required
          />
        </div>
        <div className="w-full px-3 mt-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="artist"
          >
            Artist
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="artist"
            type="text"
            name="artist"
            value={artist}
            onChange={(event) => setArtist(event.target.value)}
            placeholder="Enter artist name"
            required
          />
        </div>
        <div className="w-full px-3 mt-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="music_file"
          >
            Music File (mp3 only)
          </label>
          <input
            ref={musicFileRef}
            className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="music_file"
            name="music_file"
            type="file"
            accept="audio/mp3"
            onChange={(event) => setMusicFile(event.target.files[0])}
            required
          />
        </div>
        <div className="w-full px-3 mt-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="cover"
          >
            Cover Image (jpg, jpeg, png only)
          </label>
          <input
            ref={coverRef}
            className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="cover"
            name="cover"
            accept="image/png, image/jpeg, image/jpg"
            type="file"
            onChange={(event) => setCover(event.target.files[0])}
            required
          />
        </div>
        <div className="w-full px-3 mt-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="genres"
          >
            Genres (max 3)
          </label>
          <Select
            isMulti
            value={selectValue}
            name="genres"
            id="genres"
            options={genres.map((genre) => ({
              value: genre.id,
              label: genre.name,
            }))}
            onChange={(selectedOptions) => {
              setSelectedGenres(
                selectedOptions
                  ? selectedOptions.map((option) => option.value)
                  : []
              );
              setSelectValue(selectedOptions || []);
            }}
            styles={{
              option: (provided, state) => ({
                ...provided,
                color: "black",
              }),
            }}
            isOptionDisabled={(option) =>
              selectValue && selectValue.length >= 3
            }
            closeMenuOnSelect={false}
          />
        </div>
        <div className="w-full px-3 mt-6">
          {errorMessages && <p className="text-red-500">{errorMessages}</p>}
          <button
            className="bg-purple-700 hover:bg-purple-900 text-white font-bold py-2 px-4 rounded"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-dots loading-md"></span>
            ) : (
              "Upload Song"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default UploadSong;
