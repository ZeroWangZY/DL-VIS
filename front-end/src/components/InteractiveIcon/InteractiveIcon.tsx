import React from "react";
import "./InteractiveIcon.less";

const InteractiveIcon = (props) => {
  return (
    <img
      id={props.id}
      className={props.className}
      style={{
        position: "absolute",
        left: props.position.left,
        bottom: props.position.bottom,
        width: "18px",
      }}
      src={process.env.PUBLIC_URL + props.src}
      onClick={props.handleClicked}
      onMouseOver={props.handleHover}
      title={props.prompt}
    />
  );
};

export default InteractiveIcon;
