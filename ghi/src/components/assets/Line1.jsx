import React from "react";

export const Line1 = ({ className }) => {
  return (
    <svg
      className={`line-1 ${className}`}
      fill="none"
      height="1"
      viewBox="0 0 155 1"
      width="155"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line className="line-2" stroke="black" x2="155" y1="0.5" y2="0.5" />
    </svg>
  );
};
