import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ListStages = ({ stageFilter }) => {
  const [stages, setStages] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const url = `${process.env.REACT_APP_API_HOST}/stages`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();

        if (stageFilter) {
          setStages(data.filter((stage) => stage.host === stageFilter));
        } else {
          setStages(data);
        }
      } else {
        console.error("Failed to get Stage Details");
      }
    };

    fetchData();
  }, [stageFilter]);

  return (
    <div className="flex flex-wrap gap-7">
      {stages?.length > 0 ? (
        stages.map((stage) => (
          <div
            key={stage.id}
            className="flex flex-col w-[250px] p-4 bg-white/5 bg-opacity-80 backdrop-blur-sm animate-slideup rounded-lg cursor-pointer"
          >
            <div className="relative w-full h-300 group">
              <img
                src={stage.cover_url}
                alt="cover"
                className="w-full h-full rounded-lg"
              />
            </div>
            <div className="mt-4 flex flex-col font-semibold text-lg text-white truncate">
              {stage.name}
            </div>
            <div className="mt-1 flex flex-col">{stage.host}</div>
            <div className="mt-1 flex flex-col">{stage.genres}</div>
            <div className="mt-1 flex flex-col">{stage.playlists}</div>
            <div>
              <button className="text-xs bg-indigo-600 text-white rounded px-2 py-1">
                <Link to={`/stages/${stage.id}`}>Join</Link>
              </button>
            </div>
          </div>
        ))
      ) : (
        <div>
          <div colSpan="4">No stages found.</div>
        </div>
      )}
    </div>
  );
};
export default ListStages;
