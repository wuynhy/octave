import { useContext } from "react";
import { SearchContext } from "./SearchContext";

const SearchBar = () => {
  const { setSearchInput } = useContext(SearchContext);

  function searchItems(event) {
    setSearchInput(event.target.value);
  }

  return (
    <div className="flex justify-center">
    <input
      icon="search"
      placeholder="Search..."
      onChange={searchItems}
      className="input input-bordered w-full max-w-md"
    />
    </div>
  );
};

export default SearchBar;
