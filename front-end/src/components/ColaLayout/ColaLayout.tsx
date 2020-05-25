import React from "react";
import "./ColaLayout.css";
import ColaLayoutGraph from "./ColaLayoutGraph";

const ColaLayout: React.FC = () => {
  return (
    <div className="cola-container">
      <ColaLayoutGraph />
    </div>
  );
};

export default ColaLayout;
