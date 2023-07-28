import React, { useState, useEffect, useRef, useCallback } from "react";
import useToken from "@galvanize-inc/jwtdown-for-react";
import Select from "react-select";

const CreateStages = () => {
  const { token } = useToken();
  const [name, setName] = useState("");
  const [participants, setParticipants] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [cover, setCover] = useState(null);
  const [user, setUser] = useState({});
  const [selectValue, setSelectValue] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedParticipantsValue, setSelectedParticipantsValue] = useState(
    []
  );
  const [selectedPlaylistsValue, setSelectedPlaylistsValue] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState(null);
  const coverRef = useRef();

  useEffect(() => {
    const fetchGenres = async () => {
      const response = await fetch(`${process.env.REACT_APP_API_HOST}/genres`);
      const data = await response.json();
      setGenres(data);
    };
    fetchGenres();
  }, []);

  let currentUser = user.user ? user.user.id : null;

  const fetchUsers = useCallback(async () => {
    const response = await fetch(`${process.env.REACT_APP_API_HOST}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.error("Fetch request failed", response);
      return;
    }
    const data = await response.json();
    const users = data.users.filter((user) => user.id !== currentUser);
    setParticipants(users);
  }, [token, currentUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}/playlists`
      );
      const data = await response.json();
      setPlaylists(data);
    };
    fetchPlaylists();
  }, []);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleCoverChange = (event) => {
    const selectedFile = event.target.files[0];
    setCover(selectedFile);
  };

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
  } , [token]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessages(null);
    const formData = new FormData();
    formData.append("host_id", currentUser);
    formData.append("name", name);
    formData.append("genres", selectedGenres.join(","));
    formData.append("participants", selectedParticipants.join(","));
    formData.append("playlists", selectedPlaylists.join(","));
    if (cover) {
      formData.append("cover", cover);
    }


    const url = `${process.env.REACT_APP_API_HOST}/stages`;
    const fetchConfig = {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await fetch(url, fetchConfig);
      if (response) {
        await response.json();
        setName("");
        setSelectedGenres([]);
        setSelectedParticipants([]);
        setSelectedPlaylists([]);
        setSelectedPlaylistsValue([]);
        setSelectedParticipantsValue([]);
        setCover(null);
        coverRef.current.value = "";
        setSelectValue(null);
        setIsLoading(false);

        const closeBtn = document.querySelector(".modal .btn-ghost");
        if (closeBtn) {
          closeBtn.click();
        }
      } else {
        throw new Error("Failed to create stage");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error creating stage:", error);
    }
  };


  return (
    <form
      id="create-stage-form"
      className="w-full max-w-lg bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 center-form"
      onSubmit={handleCreate}
    >
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="title"
          >
            Stage Name
          </label>
          <input
            onChange={handleNameChange}
            placeholder="Name"
            value={name}
            required
            type="text"
            id="Name"
            className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            name="model"
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
            type="file"
            onChange={handleCoverChange}
            accept="image/png, image/jpeg, image/jpg"
            id="Cover"
            className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            name="model"
          />
        </div>
        <div className="w-full px-3 mt-3 text-gray-700 text-xs font-bold mb-2">
          <label className="form-floating mb-3" htmlFor="genres">
            GENRES
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
            closeMenuOnSelect={false}
          />
        </div>
        <div className="w-full px-3 mt-3 text-gray-700 text-xs font-bold mb-2">
          <label className="form-floating mb-3" htmlFor="participants">
            PARTICIPANTS
          </label>
          <Select
            isMulti
            value={selectedParticipantsValue}
            name="participants"
            id="participants"
            options={participants.map((participant) => ({
              value: participant.id,
              label: participant.username,
            }))}
            onChange={(selectedParticipantsOptions) => {
              setSelectedParticipants(
                selectedParticipantsOptions
                  ? selectedParticipantsOptions.map(
                      (option) => option.value
                    )
                  : []
              );
              setSelectedParticipantsValue(selectedParticipantsOptions || []);
            }}
            closeMenuOnSelect={false}
          />
        </div>
        <div className="w-full px-3 mt-3 text-gray-700 text-xs font-bold mb-2">
          <label className="form-floating mb-3" htmlFor="playlists">
            PLAYLISTS
          </label>
          <Select
            isMulti
            value={selectedPlaylistsValue}
            name="playlists"
            id="playlists"
            options={playlists.map((playlist) => ({
              value: playlist.id,
              label: playlist.name,
            }))}
            onChange={(selectedPlaylistsOptions) => {
              setSelectedPlaylists(
                selectedPlaylistsOptions
                  ? selectedPlaylistsOptions.map(
                      (option) => option.value
                    )
                  : []
              );
              setSelectedPlaylistsValue(selectedPlaylistsOptions || []);
            }}
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
              "Create Stage"
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateStages;
