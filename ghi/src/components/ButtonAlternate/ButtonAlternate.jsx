import PropTypes from "prop-types";
import React from "react";
import "./style.css";

export const ButtonAlternate = ({
  className,
  alternateClassName,
  text = "Alternate",
}) => {
  return (
    <div className={`button-alternate ${className}`}>
      <div className={`alternate ${alternateClassName}`}>{text}</div>
    </div>
  );
};

ButtonAlternate.propTypes = {
  text: PropTypes.string,
};
