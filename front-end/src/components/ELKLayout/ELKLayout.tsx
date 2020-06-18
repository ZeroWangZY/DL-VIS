import React, { useState, useEffect, useRef } from "react";
import "./ELKLayout.css";
import ELKLayoutGraph from "./ELKLayoutGraph";
import { url } from "inspector";

const ELKLayout: React.FC = () => {
  const [iteration, setIteration] = useState(0);
  let handleSubmitIteration = function (iteration: number) {
    setIteration(iteration);
  };
  const ELKLayoutRef = useRef();
  const handleCanvasBackToRight = () => {
    const elklayoutRef: any = ELKLayoutRef.current;
    if (elklayoutRef) {
      elklayoutRef.canvasBackToRight();
    }
  };
  return (
    <div className="elk-container" style={{ position: "relative" }}>
      <ELKLayoutGraph iteration={iteration} elklayoutRef={ELKLayoutRef} />
      <img
        style={{ position: "absolute", left: 10, bottom: 10, cursor: "pointer" }}
        src={process.env.PUBLIC_URL + "/assets/canvas-back-to-right.png"}
        onClick={handleCanvasBackToRight}
      />
    </div>
  );
};

export default ELKLayout;
