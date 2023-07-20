import PropTypes from "prop-types";
import React from "react";
import "../../page/styles.css";

export const ButtonAlternate = ({ alternateClassName, text = "Alternate" }) => {
  return (
    <div className="button-alternate">
      <div className={`alternate ${alternateClassName}`}>{text}</div>
    </div>
  );
};

ButtonAlternate.propTypes = {
  text: PropTypes.string,
};
