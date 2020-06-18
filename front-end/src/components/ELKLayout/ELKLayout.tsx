import React, { useState, useEffect, useRef } from "react";
import "./ELKLayout.css";
import ELKLayoutGraph from "./ELKLayoutGraph";

const ELKLayout: React.FC = () => {
  const [iteration, setIteration] = useState(0)
  let handleSubmitIteration = function (iteration: number) {
    setIteration(iteration);
  }
  const ELKLayoutRef = useRef();
  const handleCanvasBackToRight = () => {
    const elklayoutRef: any = ELKLayoutRef.current;
    if (elklayoutRef) {
      elklayoutRef.canvasBackToRight();
    }
  }
  return (
    <div className="elk-container" style={{ position: 'relative', background: 'red' }}>
      <ELKLayoutGraph iteration={iteration} elklayoutRef={ELKLayoutRef} />
      <button style={{ position: 'absolute', left: 0, top: -20, fontSize: '10px' }} onClick={handleCanvasBackToRight}>恢复原位</button>
    </div>
  )
}

export default ELKLayout;
