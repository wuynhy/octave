import React from "react";

export const Play = ({ className }) => {
  return (
    <svg
      className={`play ${className}`}
      fill="none"
      height="1"
      viewBox="0 0 1440 1"
      width="1440"
      xmls="http://www.w3.org/200/svg"
    >
      <line
        className="line"
        stroke="black"
        x1="-1.55955e-10"
        x2="1440"
        y1="0.5"
        y2="0.5"
      />
    </svg>
  );
};
