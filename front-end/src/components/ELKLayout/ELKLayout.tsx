import React from "react";
import "./ELKLayout.css";
import ELKLayoutGraph from "./ELKLayoutGraph";

const ELKLayout: React.FC = () => {
  return (
    <div className="elk-container">
      <ELKLayoutGraph />
    </div>
  );
};

export default ELKLayout;
