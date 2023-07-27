import { useState, useEffect } from "react";


const SearchBar = () => {
  const [songs, setSongs] = useState([]);
  const [stages, setStages] = useState([]); 
  const [playlists, setPlaylists] = useState([]); 
  const [searchInput, setSearchInput] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);

  const fetchData = async () => {
    const songUrl = `${process.env.REACT_APP_API_HOST}/songs`;
    const stageUrl = `${process.env.REACT_APP_API_HOST}/stages`; 
    const playlistUrl = `${process.env.REACT_APP_API_HOST}/playlists`;

    const songResponse = await fetch(songUrl);
    const stageResponse = await fetch(stageUrl); 
    const playlistResponse = await fetch(playlistUrl); 

    if (songResponse.ok && stageResponse.ok) {
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

  function searchItems(event) {
    const value = event.target.value;
    setSearchInput(value);


    if (value === "") {
            setFilteredResults([]);
    } else {

    const filteredResults = [
      ...songs.filter((song) => {
        const titleMatches = song.title.toLowerCase().includes(value.toLowerCase());
        const artistMatches = song.artist.toLowerCase().includes(value.toLowerCase());
        const genreMatches =
          song.genres?.some((genre) => genre.toLowerCase().includes(value.toLowerCase())) ||
          false;

        return titleMatches || artistMatches || genreMatches;
      }),
      ...stages.filter((stage) => {
        const stageMatches = stage.name.toLowerCase().includes(value.toLowerCase());
        const stageGenreMatches =
          stage.genres?.some((genre) => genre.toLowerCase().includes(value.toLowerCase())) ||
          false;

        return stageMatches || stageGenreMatches;
      }),
      ...playlists.filter((playlist) => {
        const playlistMatches = playlist.name.toLowerCase().includes(value.toLowerCase());

        return playlistMatches;
      }),
    ];

    setFilteredResults(filteredResults);
    }
  }

  return (
    <>
      <div>
        <input icon="search" placeholder="Search..." onChange={searchItems} />
      </div>
      {filteredResults.length > 0 && (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Title</th>
              <th>Artist</th>
              <th>Genre</th>
              <th>Cover</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result, index) => (
              <tr key={`${result.type}-${result.id}-${index}`}>
                <td>{result.title || result.name}</td>
                <td>{result.artist || result.name}</td>
                <td>{result.genres?.join(", ")}</td>
                <td>
                  <img src={result.cover_url} alt="cover" width="100" height="100" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {filteredResults.length === 0 && searchInput !== "" && <div>No stages, songs, or playlists found.</div>}
    </>
  );
};

export default SearchBar;
