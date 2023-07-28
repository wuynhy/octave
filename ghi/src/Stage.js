import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useToken from "@galvanize-inc/jwtdown-for-react";


function Stage() {
  const [stageData, setStageData] = useState(null);
  const [render, setRender] = useState(true);
  const { id: stageId } = useParams();
  const { token } = useToken();
  const [deleted, setDeleted] = useState(false);;
  const [user, setUser] = useState({});


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
      } else {
        console.error("Error deleting stage");
      }
    } catch (error) {
      console.error("Error deleting stage:", error);
    }
  };
  if (deleted) {
    return <div>Deleted</div>
  }

  if (render) {
    return <div>Loading...</div>;
  }

  if (!stageData) {
    return <div>Stage not found.</div>;
  }

  return (
    <div className="Stage">
      <h1>{stageData.name}</h1>
      <img
        src={stageData.cover_url}
        alt="Nothing"
        style={{ maxWidth: "500px" }}
      />
      <div className="Playlists">
        <h2>Playlists</h2>
        <ul>
          {stageData.playlists.map((playlists) => (
            <li key={playlists}>{playlists}</li>
          ))}
        </ul>
        <button className="text-xs bg-indigo-600 text-white rounded px-2 py-1" onClick={handleDelete}>Delete Stage</button>
      </div>
    </div>
  );
}

export default Stage;
