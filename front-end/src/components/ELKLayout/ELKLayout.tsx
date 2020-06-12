import React, { useState, useEffect } from "react";
import "./ELKLayout.css";
import ELKLayoutGraph from "./ELKLayoutGraph";

const ELKLayout: React.FC = () => {
  const [iteration, setIteration] = useState(0)
  let handleSubmitIteration = function (iteration: number) {
    setIteration(iteration);
  }
  return (
    <div className="elk-container">
      <ELKLayoutGraph iteration={iteration} />
    </div>
  );
};

export default ELKLayout;
