import { useState, useEffect } from "react";
import useToken from "@galvanize-inc/jwtdown-for-react";
import { Link } from "react-router-dom";

const Home = () => {
  const [userData, setUserData] = useState({});
  const { logout } = useToken();

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

  const username = userData.user ? userData.user.username : null;

  return (
    <>
      <h1 className="container mx-auto text-center text-4xl font-bold">
        Hello, {username ? username : "Loading..."}!
      </h1>
      <div className="container mx-auto text-center text-2xl font-bold">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={logout}
        >
          Logout
        </button>
        {username && <Link to={`/profile/${username}`}>Profile</Link>}
      </div>
    </>
  );
};

export default Home;
