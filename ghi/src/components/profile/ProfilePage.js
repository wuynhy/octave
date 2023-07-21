import { useState, useEffect, useCallback } from "react";
import useToken from "@galvanize-inc/jwtdown-for-react";
import { Link, useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { useGetAllSongsQuery } from "../../redux/services/musicPlayerApi";
import SongCard from "../SongCard";
import Loader from "../Loader";
import Error from "../Error";
import { useGetSongByIdQuery } from "../../redux/services/musicPlayerApi";

const ProfilePage = () => {
  const { token } = useToken();
  const [user, setUser] = useState(null);
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState("Songs");
  const { data: userSongs, isFetching, error } = useGetAllSongsQuery();

  const handleUserData = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8080/users/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        throw new Error("Failed to fetch user data.");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }, [username, token]);

  useEffect(() => {
    handleUserData();
  }, [handleUserData]);

  const decodedToken = jwt_decode(token);
  const currentUser = decodedToken.account.username;

  let userUsername = user?.username || "Loading...";
  let avatar = user?.avatar || "Loading...";
  let bio = user?.bio || "Loading...";
  let friends_count = user?.friends_count || 0;
  let following_count = user?.following_count || 0;

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Songs":
        if (isFetching) return <Loader title="Loading songs..." />;
        if (error) return <Error />;
        return (
          <div className="flex flex-wrap sm:justify-start justify-center gap-8">
            {userSongs?.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        );
      case "Playlists":
        return <div>Playlists content</div>;
      case "Stages":
        return <div>Stages content</div>;
      default:
        return null;
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://demos.creative-tim.com/notus-js/assets/styles/tailwind.css"
      />
      <link
        rel="stylesheet"
        href="https://demos.creative-tim.com/notus-js/assets/vendor/@fortawesome/fontawesome-free/css/all.min.css"
      />
      <main className="profile-page">
        <section
          className="relative block h-screen w-screen"
          style={{ maxHeight: "1000px", overflow: "hidden" }}
        >
          <div
            className="absolute top-0 w-full h-full bg-center bg-cover"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=crop&amp;w=2710&amp;q=80')",
              backgroundSize: "cover",
            }}
          >
            <span
              id="blackOverlay"
              className="w-full h-full relative opacity-50 bg-black"
            ></span>
          </div>
          <div
            className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px"
            style={{ transform: "translateZ(0px)" }}
          >
            <svg
              className="absolute bottom-0 overflow-hidden"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              version="1.1"
              viewBox="0 0 2560 100"
              x="0"
              y="0"
            >
              <polygon
                className="text-blueGray-200 fill-current"
                points="2560 0 0 0 0 100 2560 100"
              ></polygon>
            </svg>
          </div>
        </section>
        <section className="relative pt-1 w-screen bg-blueGray-200 -mt-1/4">
          <div className="container mx-auto px-4 pt-16">
            <div className="relative flex-col min-w-0 break-words bg-slate-600 w-full mb-6 shadow-xl rounded-lg -mt-64 ml-0">
              <div className="px-6">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full lg:w-3/12 px-4 lg:order-2 flex justify-center">
                    <div className="relative">
                      <img
                        alt="User Avatar"
                        src={
                          avatar === "default_avatar.jpg"
                            ? process.env.PUBLIC_URL + "/default_avatar.jpg"
                            : avatar
                        }
                        className="shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 max-w-150-px"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-4/12 px-4 lg:order-3 lg:text-right lg:self-center">
                    <div className="py-6 px-3 mt-32 sm:mt-0">
                      {currentUser === userUsername ? (
                        <Link to="/edit-profile">
                          <button
                            className="bg-pink-500 active:bg-pink-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                            type="button"
                          >
                            Edit Profile
                          </button>
                        </Link>
                      ) : (
                        <button
                          className="bg-pink-500 active:bg-pink-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                          type="button"
                        >
                          Add Friend
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="w-full lg:w-4/12 px-4 lg:order-1">
                    <div className="flex justify-center py-4 lg:pt-4 pt-8">
                      <div className="mr-4 p-3 text-center">
                        <span className="text-xl font-bold block uppercase tracking-wide text-white-600">
                          {friends_count}
                        </span>
                        <span className="text-sm text-blueGray-400">
                          Friends
                        </span>
                      </div>
                      <div className="mr-4 p-3 text-center">
                        <span className="text-xl font-bold block uppercase tracking-wide text-white-600">
                          {following_count}
                        </span>
                        <span className="text-sm text-blueGray-400">
                          Following
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-4xl font-semibold leading-normal mb-2 text-pink-500 mb-2">
                    {username}
                  </h3>
                  <p className="text-lg text-blueGray-600">{bio}</p>
                </div>
                <ul
                  className="flex list-none flex-row flex-wrap border-b-0 pl-0"
                  role="tablist"
                  data-te-nav-ref
                >
                  <li role="presentation">
                    <a
                      onClick={() => handleTabClick("Songs")}
                      className="my-2 block border-x-0 border-b-2 border-t-0 border-transparent px-7 pt-4 text-xs font-medium uppercase leading-tight text-neutral-500 hover:isolate hover:border-transparent hover:bg-neutral-100 focus:isolate focus:border-transparent data-[te-nav-active]:border-primary data-[te-nav-active]:text-primary dark:text-neutral-400 dark:hover:bg-transparent dark:data-[te-nav-active]:border-primary-400 dark:data-[te-nav-active]:text-primary-400"
                      role="tab"
                      aria-controls="tabs-home"
                      aria-selected="true"
                    >
                      Songs
                    </a>
                  </li>
                  <li role="presentation">
                    <a
                      onClick={() => handleTabClick("Playlists")}
                      className="focus:border-transparen my-2 block border-x-0 border-b-2 border-t-0 border-transparent px-7 pt-4 text-xs font-medium uppercase leading-tight text-neutral-500 hover:isolate hover:border-transparent hover:bg-neutral-100 focus:isolate data-[te-nav-active]:border-primary data-[te-nav-active]:text-primary dark:text-neutral-400 dark:hover:bg-transparent dark:data-[te-nav-active]:border-primary-400 dark:data-[te-nav-active]:text-primary-400"
                      role="tab"
                      aria-controls="tabs-profile"
                      aria-selected="false"
                    >
                      Playlists
                    </a>
                  </li>
                  <li role="presentation">
                    <a
                      onClick={() => handleTabClick("Stages")}
                      className="my-2 block border-x-0 border-b-2 border-t-0 border-transparent px-7 pt-4 text-xs font-medium uppercase leading-tight text-neutral-500 hover:isolate hover:border-transparent hover:bg-neutral-100 focus:isolate focus:border-transparent data-[te-nav-active]:border-primary data-[te-nav-active]:text-primary dark:text-neutral-400 dark:hover:bg-transparent dark:data-[te-nav-active]:border-primary-400 dark:data-[te-nav-active]:text-primary-400"
                      role="tab"
                      aria-controls="tabs-messages"
                      aria-selected="false"
                    >
                      Stages
                    </a>
                  </li>
                </ul>
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "gray",
                    marginBottom: "20px",
                  }}
                ></div>
                {renderTabContent()}
                <div className="mt-1 py-5 text-center">
                  <div className="flex flex-wrap justify-center">
                    <div
                      className="w-full lg:w-9/12 px-4"
                      style={{ marginTop: "20px" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ProfilePage;
