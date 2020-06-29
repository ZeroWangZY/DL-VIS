import React from "react";
import "./InteractiveIcon.less";

const InteractiveIcon = (props) => {
    return (
        <img
            id={props.id}
            className={props.className}
            style={{ left: props.position.left, bottom: props.position.bottom }}
            src={process.env.PUBLIC_URL + props.src}
            onClick={props.handleClicked}
        />
    )
}

export default InteractiveIcon;