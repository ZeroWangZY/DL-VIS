import React, { useState, useEffect, useRef } from "react";
import "./ELKLayout.css";
import ELKLayoutGraph from "./ELKLayoutGraph";

interface Props {
  bottom: number; 
  right: number;
}

const ELKLayout: React.FC<Props> = (props: Props) => {
  const [iteration, setIteration] = useState(0)

  return (
    <div className="elk-container">
      <ELKLayoutGraph iteration={iteration} bottom={props.bottom} right={props.right}/>
    </div>
  );
};

export default ELKLayout;
