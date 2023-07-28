import React, { useState, useEffect} from "react";
import useToken from "@galvanize-inc/jwtdown-for-react";
import Select from "react-select";
const CreateStages = () => {
    const { token } = useToken();
    const [name, setName] = useState("")
    const [participants, setParticipants] = useState("")
    const [playlists, setPlaylists] = useState("")
    const [cover, setCover] = useState("")
    const [user, setUser] = useState({});
    const [selectValue, setSelectValue] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [genres, setGenres] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const fetchGenres = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_HOST}/genres`);
        const data = await response.json();
        setGenres(data);
        };
        fetchGenres();
    }, []);
    const currentUser = token

    const handleNameChange = (event) => {
        setName(event.target.value)
    }
    const handlePlaylistChange = (event) => {
        setPlaylists(event.target.value)
    }
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
    }, [user]);

    const handleCreate = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("host_id", currentUser);
    formData.append("name", name);
    formData.append("genres", selectedGenres.join(","));
    formData.append("participants", participants);
    formData.append("playlists", playlists);
    if (cover) {
        formData.append("cover", cover);
    }

    const url = `${process.env.REACT_APP_API_HOST}/stages/`;
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
        setName("");
        setSelectedGenres([]);
        setParticipants("");
        setPlaylists("");
        setCover("")
        setSelectValue(null);
        setIsLoading(false);
        alert("Stage Created");
        } else {
        alert("Failed to create stage");
        }
    } catch (error) {
        alert("Failed to create stage");
    }
    };
      useEffect(() => {
  }, []);
    return(
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
        <input onChange={handleNameChange} placeholder="Name" value={name} required type="text" id="Name" className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" name="model" />
        </div>
        <div className="w-full px-3 mt-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="playlists"
          >
            Playlists
          </label>
        <input onChange={handlePlaylistChange} placeholder="Playlists" value={playlists}  type="text" id="Playlists" className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" name="model" />
        </div>
        <div className="w-full px-3 mt-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="cover"
          >
            Cover Image (jpg, jpeg, png only)
          </label>
        <input type="file" onChange={handleCoverChange} accept="image/png, image/jpeg" id="Cover" className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" name="model"/>
        </div>
            <div className="w-full px-3 mt-3 text-gray-700 text-xs font-bold mb-2" >
            <label
                className="form-floating mb-3"
                htmlFor="genres"
            >
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
        <div className="w-full px-3 mt-6">
          <button
            className="bg-purple-700 hover:bg-purple-900 text-white font-bold py-2 px-4 rounded"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-dots loading-md"></span>
            ) : (
              "Upload"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default CreateStages;
