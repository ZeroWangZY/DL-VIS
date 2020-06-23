import React, { useState, useEffect, useRef } from "react";
import "./ELKLayout.css";
import ELKLayoutGraph from "./ELKLayoutGraph";
import { url } from "inspector";

interface Props {
  bottom: number; 
  right: number;
}

const ELKLayout: React.FC<Props> = (props: Props) => {
  const [iteration, setIteration] = useState(0)
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
    <div className="elk-container">
      <ELKLayoutGraph iteration={iteration} bottom={props.bottom} right={props.right}/>
      <img
        style={{ position: "absolute", left: 10, bottom: 10, cursor: "pointer" }}
        src={process.env.PUBLIC_URL + "/assets/canvas-back-to-right.png"}
        onClick={handleCanvasBackToRight}
      />
    </div>
  );
};

export default ELKLayout;
