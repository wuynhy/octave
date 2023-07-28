import React from "react";
import { ButtonAlternateWrapper } from "../components/mainpage/ButtonAlternateWrapper";
import "./style.css";
import { Link } from "react-router-dom";


const Main = () => {

  return (
    <div className="index">
      <div className="overlap-wrapper">
        <div className="overlap">
          <div className="group">
            <div className="overlap-group">
              <h1 className="text-wrapper">Gobi</h1>
              <img
                className="rectangle"
                alt="Rectangle"
                src="https://anima-uploads.s3.amazonaws.com/projects/64b5dd70a447c8f3e4fdf853/releases/64b5e3a07c9de274b3a0edf6/img/rectangle-52.png"
              />
            </div>
          </div>
          <div className="overlap-group-wrapper">
            <div className="div">
              <div className="text-wrapper-2">Sahara</div>
              <img
                className="img"
                alt="Rectangle"
                src="https://anima-uploads.s3.amazonaws.com/projects/64b5dd70a447c8f3e4fdf853/releases/64b5e3a07c9de274b3a0edf6/img/rectangle-51.png"
              />
            </div>
          </div>
          <div className="div-wrapper">
            <div className="overlap-2">
              <div className="text-wrapper-3">DoLabs</div>
              <img
                className="rectangle-2"
                alt="Rectangle"
                src="https://anima-uploads.s3.amazonaws.com/projects/64b5dd70a447c8f3e4fdf853/releases/64b5e3a07c9de274b3a0edf6/img/rectangle-50.png"
              />
            </div>
          </div>
          <img
            className="element"
            alt="Element"
            src="https://anima-uploads.s3.amazonaws.com/projects/64b5dd70a447c8f3e4fdf853/releases/64b5e3a07c9de274b3a0edf6/img/20230621-002249-0000-removebg-preview-2.png"
          />
            <Link to="/home">
            <ButtonAlternateWrapper
                buttonAlternateAlternateClassName="button-alternate-instance"
                buttonAlternateButtonAlternateClassName="button-alternate-default-instance"
                buttonAlternateText="Listen Now"
                className="button-alternate-default"
            />
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Main;
