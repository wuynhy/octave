import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useToken from "@galvanize-inc/jwtdown-for-react";

function Stage() {
  const [stageData, setStageData] = useState(null);
  const [render, setRender] = useState(true);
  const { id: stageId } = useParams();
  const { token } = useToken();
  const [deleted, setDeleted] = useState(false);
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  let username = user.user ? user.user.username : null;

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
  }, [username]);

  useEffect(() => {
    const fetchStageDetails = async () => {
      const url = `${process.env.REACT_APP_API_HOST}/stages/${stageId}`;
      const fetchConfig = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      try {
        const response = await fetch(url, fetchConfig);
        if (response.ok) {
          const data = await response.json();
          setStageData(data);
        } else {
          console.error("Stage Details not found");
        }
      } finally {
        setRender(false);
      }
    };

    fetchStageDetails();
  }, [stageId, token]);

  const handleDelete = async () => {
    const url = `${process.env.REACT_APP_API_HOST}/stages/${stageId}`;
    const fetchConfig = {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await fetch(url, fetchConfig);
      if (response.ok) {
        setDeleted(true);
        navigate("/home");
      } else {
        console.error("Error deleting stage");
      }
    } catch (error) {
      console.error("Error deleting stage:", error);
    }
  };

  const renderPlaylists = () => {
    if (!stageData.playlists || stageData.playlists.length === 0) {
      return <p>No playlists available</p>;
    }
    const playlists = stageData.playlists[0].split(",");
    return playlists.map((playlist, i) => (
      <div key={i} className="inline-block mr-2 mb-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          {playlist}
        </span>
      </div>
    ));
  };

  if (deleted) {
    return <div>Deleted</div>;
  }

  if (render) {
    return <div>Loading...</div>;
  }

  if (!stageData) {
    return <div>Stage not found.</div>;
  }

  return (
    <div
      className="Stage"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <h1 className="text-3xl font-bold m-4 uppercase bg-gradient-to-r text-transparent bg-clip-text from-blue-500 to-purple-700 p-2">{stageData.name}</h1>      <img
        src={stageData.cover_url}
        alt="Nothing"
        style={{ maxWidth: "500px" }}
      />
      <div className="Playlists mb-20">
        <h2 className="font-bold text-xl mt-5 mb-5">Playlists</h2>
        {renderPlaylists()}
        <div className="mb-16">
          {stageData.host === username && (
            <button
              className="text-xs bg-indigo-600 text-white rounded px-2 py-1 mt-5 mb-16"
              onClick={handleDelete}
            >
              Delete Stage
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Stage;
