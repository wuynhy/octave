import React, { useState, useEffect } from "react";
import "./nav.css";
import clsx from "clsx";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useToken from "@galvanize-inc/jwtdown-for-react";
import Loading from "react-loading";

const SidebarLeft = () => {
  const [active, setActive] = useState(0);
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useToken();
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    setIsLoading(false);
  }, [location]);

  const username = userData.user ? userData.user.username : null;

  const SidebarIcons = ({ index }) => {
    const Icons = ["home", "person", "logout"];
    const iconText = Icons[index];

    if (iconText === "logout") {
      return (
        <span
          className={clsx("material-icons", {
            "text-gray-500": isLoading,
          })}
          style={{ fontSize: "30px" }}
          onClick={() => {
            if (!isLoading) {
              setIsLoading(true);
              logout();
              navigate("/");
            }
          }}
        >
          {iconText}
        </span>
      );
    }

    let linkTo;
    if (index === 0) {
      linkTo = "/home";
    } else if (index === 1 && username) {
      linkTo = `/profile/${username}`;
    }

    return (
      <Link
        to={linkTo}
        className={clsx("material-icons", {
          "text-gray-500": index === 1 && !username,
        })}
        style={{ fontSize: "30px" }}
        onClick={(event) => {
          if (isLoading) {
            event.preventDefault();
          } else {
            setIsLoading(true);
          }
        }}
      >
        {iconText}
      </Link>
    );
  };

  return (
    <div className="w-28 mt-10" style={{ marginRight: "2rem" }}>
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <Loading type={"spin"} color={"#333"} height={"20%"} width={"20%"} />
        </div>
      )}
      <div className="sidebar-left rounded-3xl shadow-xl w-20 ml-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={clsx(
              "h-20 w-20 flex items-center justify-center cursor-pointer",
              active === i && "sidebar-left-active text-white"
            )}
            onClick={() => {
              if (!isLoading) {
                setActive(i);
              }
            }}
          >
            <SidebarIcons index={i} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarLeft;
