import PropTypes from "prop-types";
import React from "react";
import { ButtonAlternate } from "../ButtonAlternate";


export const ButtonAlternateWrapper = ({
  className,
  buttonAlternateAlternateClassName,
  buttonAlternateButtonAlternateClassName,
  buttonAlternateText = "Edit Profile",
}) => {
  return (
    <div className={`button-alternate-wrapper ${className}`}>
      <ButtonAlternate
        alternateClassName={buttonAlternateAlternateClassName}
        className={buttonAlternateButtonAlternateClassName}
        text={buttonAlternateText}
      />
    </div>
  );
};

ButtonAlternateWrapper.propTypes = {
  buttonAlternateText: PropTypes.string,
};
