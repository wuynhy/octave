import PropTypes from "prop-types";
import React from "react";

export const IconSearch1 = ({ color = "#212429", className }) => {
  return (
    <svg
      className={`icon-search-1 ${className}`}
      fill="none"
      height="30"
      viewBox="0 0 30 30"
      width="30"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        d="M13.75 23.75C19.2728 23.75 23.75 19.2728 23.75 13.75C23.75 8.22715 19.2728 3.75 13.75 3.75C8.22715 3.75 3.75 8.22715 3.75 13.75C3.75 19.2728 8.22715 23.75 13.75 23.75Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        className="path"
        stroke="#212429"
        strokeLinecap="round"
        d="M26.25 26.25L20.8125 20.8125"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
};
IconSearch1.propTypes = {
  color: PropTypes.string,
};
