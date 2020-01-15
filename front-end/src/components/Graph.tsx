import React from "react";
import { getDemoGraphAPI } from "../api/graph";

const Graph: React.FC = () => {
  getDemoGraphAPI();
  return <div className="Graph">graph here</div>;
};

export default Graph;
