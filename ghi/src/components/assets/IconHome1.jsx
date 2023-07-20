import PropTypes from "prop-types";
import React from "react";

export const IconHome1 = ({ color = "#212429", className }) => {
  return (
    <svg
      className={`icon-home-1 ${className}`}
      fill="none"
      height="30"
      viewBox="0 0 30 30"
      width="30"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        d="M3.75 11.25L15 2.5L26.25 11.25V25C26.25 25.663 25.9866 26.2989 25.5178 26.7678C25.8489 27.2366 24.413 27.5 23.75 27.5H6.25C5.58696 27.5 4.95187 27.2366 4.48223 26.7678C4.01339 26.2989 3.75
            25.663 3.75 25V11.25Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        className="path"
        d="M11.25 27.5V15H18.75V27.5"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
};
IconHome1.propTypes = {
  color: PropTypes.string,
};
