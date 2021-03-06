import React from "react";
import GraphModeSelection from "../../preference/GraphModeSelection";
import "./index.less";

export default () => {
  return (
    <div className="header-bar">
      <img src={process.env.PUBLIC_URL + "/logo-mindspore-new.png"} alt="log" />
      <GraphModeSelection />
    </div>
  );
};
