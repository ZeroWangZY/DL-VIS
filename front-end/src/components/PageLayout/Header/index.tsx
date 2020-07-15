import React from "react";
import ConceptualGraphMode from "../../preference/ConceptualGraphMode";
import "./index.less";

export default () => {
  return (
    <div className="header-bar">
      <img src={process.env.PUBLIC_URL + "logo-mindspore-new.png"} alt="log" />
      <ConceptualGraphMode />
    </div>
  );
};
