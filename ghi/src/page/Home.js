import { useState, useEffect, useContext } from "react";
import SongCarousel from "../components/carousel/SongCarousel";
import PlaylistCarousel from "../components/carousel/PlaylistCarousel";
import StageCarousel from "../components/carousel/StageCarousel";
import SearchBar from "../components/search/SearchBar";
import { SearchContext } from "../components/search/SearchContext";

const Home = () => {
  const [userData, setUserData] = useState({});
  const { searchInput } = useContext(SearchContext);
  const [songs, setSongs] = useState([]);
  const [stages, setStages] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);

  const fetchData = async () => {
    const songUrl = `${process.env.REACT_APP_API_HOST}/songs`;
    const stageUrl = `${process.env.REACT_APP_API_HOST}/stages`;
    const playlistUrl = `${process.env.REACT_APP_API_HOST}/playlists`;

    const songResponse = await fetch(songUrl);
    const stageResponse = await fetch(stageUrl);
    const playlistResponse = await fetch(playlistUrl);

    if (songResponse.ok && stageResponse.ok && playlistResponse.ok) {
      const songData = await songResponse.json();
      const stageData = await stageResponse.json();
      const playlistData = await playlistResponse.json();

      setSongs(songData);
      setStages(stageData);
      setPlaylists(playlistData);
    } else {
      console.error("Failed to get Song, Stage, or Playlist Details");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchInput !== "") {
      const filteredSongs = songs.filter((song) => {
        const titleMatches = song.title
          .toLowerCase()
          .includes(searchInput.toLowerCase());
        const artistMatches = song.artist
          .toLowerCase()
          .includes(searchInput.toLowerCase());
        const genreMatches =
          song.genres?.some((genre) =>
            genre.toLowerCase().includes(searchInput.toLowerCase())
          ) || false;

        return titleMatches || artistMatches || genreMatches;
      });

      const filteredStages = stages.filter((stage) => {
        const stageMatches = stage.name
          .toLowerCase()
          .includes(searchInput.toLowerCase());
        const stageHostMatches = stage.host
          .toLowerCase()
          .includes(searchInput.toLowerCase());
        const stageGenreMatches =
          stage.genres?.some((genre) =>
            genre.toLowerCase().includes(searchInput.toLowerCase())
          ) || false;

        return stageMatches || stageHostMatches || stageGenreMatches;
      });

      const filteredPlaylists = playlists.filter((playlist) => {
        const playlistMatches = playlist.name
          .toLowerCase()
          .includes(searchInput.toLowerCase());
        const playlistOwnerMatches = playlist.owner
          .toLowerCase()
          .includes(searchInput.toLowerCase());
        return playlistMatches || playlistOwnerMatches;
      });

      setFilteredResults({
        songs: filteredSongs,
        stages: filteredStages,
        playlists: filteredPlaylists,
      });
    } else {
      setFilteredResults({ songs: [], stages: [], playlists: [] });
    }
  }, [searchInput, songs, stages, playlists]);

  const handleUserData = async () => {
    const url = `${process.env.REACT_APP_API_HOST}/token`;
    fetch(url, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setUserData(data);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    handleUserData();
  }, []);

  const renderSongsTable = () => {
    const songs = filteredResults.songs;

    return (
      songs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="text-white">Cover</th>
                <th className="text-white">Title</th>
                <th className="text-white">Artist</th>
                <th className="text-white">Genre</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song, index) => (
                <tr key={`song-${song.id}-${index}`}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-20 h-20">
                          <img src={song.cover_url} alt="Song cover" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-bold text-white">{song.title}</div>
                  </td>
                  <td className="text-white">{song.artist}</td>
                  <td className="text-white">{song.genres.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    );
  };

  const renderPlaylistsTable = () => {
    const playlists = filteredResults.playlists;

    return (
      playlists.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="text-white">Cover</th>
                <th className="text-white">Name</th>
                <th className="text-white">Owner</th>
                <th className="text-white">Description</th>
              </tr>
            </thead>
            <tbody>
              {playlists.map((playlist, index) => (
                <tr key={`playlist-${playlist.id}-${index}`}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-20 h-20">
                          <img src={playlist.cover_url} alt="Playlist cover" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-bold text-white">{playlist.name}</div>
                  </td>
                  <td className="text-white">{playlist.owner}</td>
                  <td className="text-white">{playlist.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    );
  };

  const renderStagesTable = () => {
    const stages = filteredResults.stages;

    return (
      stages.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="text-white">Cover</th>
                <th className="text-white">Name</th>
                <th className="text-white">Host</th>
                <th className="text-white">Genre</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((stage, index) => (
                <tr key={`stage-${stage.id}-${index}`}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-20 h-20">
                          <img src={stage.cover_url} alt="Stage cover" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-bold text-white">{stage.name}</div>
                  </td>
                  <td className="text-white">{stage.host}</td>
                  <td className="text-white">{stage.genres.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    );
  };

  const renderResultsTable = () => (
    <div className="container mx-5 ms-text-right text-4xl font-bold pt-10 pb-10">
      {filteredResults.songs.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-start mt-10 text-purple-500">SONGS</h2>
          {renderSongsTable()}
        </>
      )}
      {filteredResults.playlists.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-start mt-10 text-purple-500">PLAYLISTS</h2>
          {renderPlaylistsTable()}
        </>
      )}
      {filteredResults.stages.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-start mt-10 text-purple-500">STAGES</h2>
          {renderStagesTable()}
        </>
      )}
      {filteredResults.songs.length === 0 &&
        filteredResults.stages.length === 0 &&
        filteredResults.playlists.length === 0 &&
        searchInput !== "" && <div>No stages, songs, or playlists found.</div>}
    </div>
  );

  const username = userData.user ? userData.user.username : null;

  return (
    <div
      className="relative pt-1 mx-auto w-screen text-center text-4x4 font-bold"
      style={{
        minHeight: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        paddingBottom: "150px",
        backgroundImage: `linear-gradient(109.6deg, rgb(27, 27, 79) 11.2%, rgb(120, 201, 244) 100.2%)`,
      }}
    >
      <h1 className="container2 mx-5 ms-text-right text-4xl font-bold pt-10 pb-10 text-animate">
        Hello, {username ? username : "Loading..."}!
      </h1>
      <SearchBar />
      {searchInput === "" ? (
        <>
          <h2
            className="text-2xl font-bold text-start text-gray-50"
            style={{ marginLeft: "155px", marginBottom: "10px" }}
          >
            Stages
          </h2>
          <StageCarousel />
          <h2
            className="text-2xl font-bold text-start mt-10 text-gray-50"
            style={{ marginLeft: "155px", marginBottom: "10px" }}
          >
            Songs
          </h2>
          <SongCarousel />
          <h2
            className="text-2xl font-bold text-start mt-10 text-gray-50"
            style={{ marginLeft: "155px", marginBottom: "10px" }}
          >
            Playlists
          </h2>
          <PlaylistCarousel />
        </>
      ) : (
        renderResultsTable()
      )}
    </div>
  );
};

export default Home;
