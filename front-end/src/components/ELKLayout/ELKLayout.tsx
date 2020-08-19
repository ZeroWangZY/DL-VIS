import React, { useState, useEffect, useRef } from "react";
import "./ELKLayout.css";
import ELKLayoutGraph from "./ELKLayoutGraph";
import * as d3 from "d3";
import Threejs from "./threejs";
import RenderGraph from './threejs-render/RenderGraph';


interface Props {
  bottom: number;
  right: number;
}

// const ELKLayout: React.FC<Props> = (props: Props) => {
const ELKLayout: React.FC = () => {
  const [iteration, setIteration] = useState(0);
  return (
    <div className="elk-container">
      {/* <ELKLayoutGraph iteration={iteration} /> */}
      <RenderGraph />
    </div>

    

  );
};

export default ELKLayout;
