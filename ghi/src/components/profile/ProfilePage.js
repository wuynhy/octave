import { useState, useEffect, useCallback } from "react";
import useToken from "@galvanize-inc/jwtdown-for-react";
import { useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { useGetAllSongsQuery } from "../../redux/services/musicPlayerApi";
import SongCard from "../SongCard";
import Loader from "../Loader";
import Error from "../Error";
import { useDispatch } from "react-redux";
import { setActiveSong } from "../../redux/features/playerSlice";
import FriendsTabComponent from "../friends/FriendsTabComponent";
import ErrorBoundary from "../friends/ErrorBoundary";
import EditProfile from "./EditProfile";
import UploadSong from "../UploadSong";
import { MdAddCircleOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { token } = useToken();
  const [user, setUser] = useState(null);
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState("Songs");
  const { data: allSongs, isFetching, error } = useGetAllSongsQuery();
  const userSongs = allSongs || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const navigate = useNavigate();
  const [userNotFound, setUserNotFound] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  const addFriend = (friendUsername) => {
    fetch(`${process.env.REACT_APP_API_HOST}/friendships/${friendUsername}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((friendshipCreated) => {
        if (friendshipCreated) {
          alert("Friend request sent successfully!");
        } else {
          alert("Failed to send friend request.");
        }
      });
  };

  const checkFriendship = (friendUsername) => {
    fetch(
      `${process.env.REACT_APP_API_HOST}/friendships/check/${friendUsername}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setIsFriend(data);
      });
  };

  useEffect(() => {
    checkFriendship(username);
  }, [username]);

  const deleteFriend = (friendUsername) => {
    fetch(`${process.env.REACT_APP_API_HOST}/friendships/${friendUsername}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          alert("Friendship deleted successfully!");
        } else {
          return response.json().then((data) => {
            throw new Error(data.detail || "Failed to delete the friend.");
          });
        }
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  const ModalContent = ({ formType, onClose }) => {
    let formContent;

    switch (formType) {
      case "SongForm":
        formContent = <UploadSong />;
        break;
      case "ProfileForm":
        formContent = <EditProfile />;
        break;
      case "PlaylistForm":
        // formContent = <UploadPlaylist />;
        break;
      case "StageForm":
        // formContent = <UploadStage />;
        break;
      default:
        formContent = null;
    }

    return (
      <div className="modal">
        <div
          className="modal-box min-h-screen"
          style={{ maxWidth: "100%", width: "40%" }}
        >
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            style={{ backgroundColor: "transparent" }}
            onClick={onClose}
          >
            ✕
          </button>
          <div className="h-full">{formContent}</div>
        </div>
        <label id="my_modal_7" className="modal-backdrop" htmlFor="my_modal_7">
          Close
        </label>
      </div>
    );
  };

  const handleUserData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}/users/${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}/users/${searchUsername}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setUserNotFound(false);
        navigate(`/profile/${searchUsername}`);
        setSearchUsername("");
      } else if (response.status === 404) {
        setUserNotFound(true);
        throw new Error("User not found.");
      } else {
        setUserNotFound(false);
        throw new Error("Failed to fetch user data.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const decodedToken = jwt_decode(token);
  const currentUser = decodedToken.account.username;

  let userUsername = user?.username || "Loading...";
  let avatar = user?.avatar_url || "Loading...";
  let bio = user?.bio || "";
  let friends_count = user?.friends_count || 0;
  let following_count = user?.following_count || 0;

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    dispatch(setActiveSong(null));
  }, [dispatch]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Songs":
        if (isFetching) return <Loader title="Loading songs..." />;
        if (error) return <Error />;
        const userUploadedSongs = userSongs.filter(
          (song) => song.uploader === username
        );

        const showUploadButton = currentUser === username;

        return (
          <>
            {showUploadButton && (
              <>
                <input
                  type="checkbox"
                  id="my_modal_7"
                  className="modal-toggle"
                  checked={isModalOpen}
                  onChange={() => setIsModalOpen(!isModalOpen)}
                />
                {isModalOpen && (
                  <ModalContent
                    formType="SongForm"
                    onClose={() => setIsModalOpen(false)}
                  />
                )}
                <div className="flex justify-end">
                  <label
                    id="modal_7"
                    htmlFor="my_modal_7"
                    className="btn flex items-center justify-center w-15 h-10"
                    style={{
                      backgroundColor: "transparent",
                      marginRight: "10px",
                    }}
                  >
                    <MdAddCircleOutline size={25} />
                  </label>
                </div>
              </>
            )}
            {userUploadedSongs.length === 0 ? (
              <div className="flex justify-center mt-8 text-lg font-semibold text-white">
                No songs available.
              </div>
            ) : (
              <div className="flex flex-wrap sm:justify-start justify-center gap-8">
                {userUploadedSongs.map((song, index) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    allSongs={userSongs}
                    i={index}
                  />
                ))}
              </div>
            )}
          </>
        );
      case "Playlists":
        return <div>Playlists content</div>;
      case "Stages":
        return <div>Stages content</div>;
      case "Friends":
        return (
          <ErrorBoundary>
            <FriendsTabComponent currentUserID={user?.id} token={token} />
          </ErrorBoundary>
        );
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
          className="relative pt-1 w-screen h-screen bg-blueGray-200"
          style={{ overflow: "hidden" }}
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
        <section className="relative pt-1 w-screen h-screen bg-blueGray-200 -mt-1/4">
          <div className="container mx-auto px-4 pt-16">
            <div className="relative flex-col min-w-0 break-words bg-slate-600 w-full mb-5 shadow-xl rounded-lg -mt-64 ml-0">
              <div className="px-6">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full lg:w-3/12 px-4 lg:order-2 flex justify-center">
                    <div className="hidden sm:block h-32 w-32 mr-4 rounded-full overflow-hidden relative top-[-60px] ">
                      <img
                        alt="User Avatar"
                        src={
                          avatar === "default_avatar.jpg"
                            ? "https://myoctavebucket.s3.us-west-1.amazonaws.com/1*W35QUSvGpcLuxPo3SRTH4w.png"
                            : avatar
                        }
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-4/12 px-4 lg:order-3 lg:text-right lg:self-center">
                    <div className="py-6 px-3 mt-32 sm:mt-0">
                      {currentUser === userUsername ? (
                        <button
                          className="bg-pink-500 active:bg-pink-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                          type="button"
                          onClick={() => setIsEditProfileModalOpen(true)}
                        >
                          Edit Profile
                        </button>
                      ) : isFriend ? (
                        <button
                          className="bg-red-600 active:bg-red-700 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                          type="button"
                          onClick={() => deleteFriend(username)}
                        >
                          End Friendship
                        </button>
                      ) : (
                        <button
                          className="bg-pink-500 active:bg-pink-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                          type="button"
                          onClick={() => addFriend(username)}
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
                  <p className="text-lg text-white-600">{bio}</p>
                </div>
                <ul
                  className="flex list-none flex-row flex-wrap border-b-0 pl-0 justify-start"
                  role="tablist"
                  data-te-nav-ref
                >
                  <li role="presentation">
                    <button
                      onClick={() => handleTabClick("Songs")}
                      className="my-2 block border-x-0 border-b-2 border-t-0 border-transparent px-7 pt-4 text-xs font-medium uppercase leading-tight text-neutral-500 hover:isolate hover:border-transparent hover:bg-neutral-100 focus:isolate hover:text-neutral-700 data-[te-nav-active]:border-primary data-[te-nav-active]:text-primary dark:text-neutral-400 dark:hover:bg-transparent dark:data-[te-nav-active]:border-primary-400 dark:data-[te-nav-active]:text-primary-400"
                      role="tab"
                      aria-controls="tabs-home"
                      aria-selected="true"
                    >
                      Songs
                    </button>
                  </li>
                  <li role="presentation">
                    <button
                      onClick={() => handleTabClick("Playlists")}
                      className="my-2 block border-x-0 border-b-2 border-t-0 border-transparent px-7 pt-4 text-xs font-medium uppercase leading-tight text-neutral-500 hover:isolate hover:border-transparent hover:bg-neutral-100 focus:isolate hover:text-neutral-700 data-[te-nav-active]:border-primary data-[te-nav-active]:text-primary dark:text-neutral-400 dark:hover:bg-transparent dark:data-[te-nav-active]:border-primary-400 dark:data-[te-nav-active]:text-primary-400"
                      role="tab"
                      aria-controls="tabs-profile"
                      aria-selected="false"
                    >
                      Playlists
                    </button>
                  </li>
                  <li role="presentation">
                    <button
                      onClick={() => handleTabClick("Stages")}
                      className="my-2 block border-x-0 border-b-2 border-t-0 border-transparent px-7 pt-4 text-xs font-medium uppercase leading-tight text-neutral-500 hover:isolate hover:border-transparent hover:bg-neutral-100 focus:isolate hover:text-neutral-700 data-[te-nav-active]:border-primary data-[te-nav-active]:text-primary dark:text-neutral-400 dark:hover:bg-transparent dark:data-[te-nav-active]:border-primary-400 dark:data-[te-nav-active]:text-primary-400"
                      role="tab"
                      aria-controls="tabs-messages"
                      aria-selected="false"
                    >
                      Stages
                    </button>
                  </li>
                  <li role="presentation">
                    <a
                      onClick={() => handleTabClick("Friends")}
                      className="my-2 block border-x-0 border-b-2 border-t-0 border-transparent px-7 pt-4 text-xs font-medium uppercase leading-tight text-neutral-500 hover:isolate hover:border-transparent hover:bg-neutral-100 focus:isolate focus:border-transparent data-[te-nav-active]:border-primary data-[te-nav-active]:text-primary dark:text-neutral-400 dark:hover:bg-transparent dark:data-[te-nav-active]:border-primary-400 dark:data-[te-nav-active]:text-primary-400"
                      role="tab"
                      aria-controls="tabs-messages"
                      aria-selected="false"
                    >
                      Friends
                    </a>
                  </li>
                  <div className="flex items-center ml-auto">
                    {userNotFound && (
                      <p className="text-red-500 text-sm mt-2">
                        User not found.
                      </p>
                    )}
                    <input
                      type="text"
                      className="rounded-md px-3 py-2 mr-2 text-sm text-black"
                      placeholder="Enter username"
                      value={searchUsername}
                      onChange={(e) => {
                        setSearchUsername(e.target.value);
                        setUserNotFound(false);
                      }}
                    />
                    <button
                      className="bg-pink-500 active:bg-pink-600 text-white font-bold py-2 px-3 rounded-md text-sm"
                      onClick={handleSearch}
                    >
                      Search
                    </button>
                  </div>
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
      <input
        type="checkbox"
        id="edit_profile_modal"
        className="modal-toggle"
        checked={isEditProfileModalOpen}
        onChange={() => setIsEditProfileModalOpen(!isEditProfileModalOpen)}
      />
      {isEditProfileModalOpen && (
        <ModalContent
          formType="ProfileForm"
          onClose={() => setIsEditProfileModalOpen(false)}
        />
      )}
    </>
  );
};

export default ProfilePage;
