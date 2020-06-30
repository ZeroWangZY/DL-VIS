import React, { useState, useEffect, useRef } from "react";
import "./ELKLayout.css";
import ELKLayoutGraph from "./ELKLayoutGraph";
import * as d3 from "d3";

interface Props {
  bottom: number;
  right: number;
}

// const ELKLayout: React.FC<Props> = (props: Props) => {
const ELKLayout: React.FC = () => {
  const [iteration, setIteration] = useState(0);

  return (
    <div className="elk-container">
      <ELKLayoutGraph iteration={iteration} />
    </div>
  );
};

export default ELKLayout;
