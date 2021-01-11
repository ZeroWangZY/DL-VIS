import React, { useState } from "react";
import GraphSelector from "../../preference/GraphSelector";
import NodeSelector from "../../preference/NodeSelector";

import './FixedLayout.less';

const FixedContainer: React.FC = () => {
  return <div id="fixed-container">
    <div id="controller-panel-container" className="fixed-panel">
      <div className="fixed-panel-title">控制面板</div>
      <GraphSelector />
      <NodeSelector />
    </div>
    <div id="computing-graph-container" className="fixed-panel">
      <div className="fixed-panel-title">计算图面板</div>
    </div>
    <div id="node-info-container" className="fixed-panel">
      <div className="fixed-panel-title">节点信息面板</div>
      
    </div>
  </div>;
};

export default FixedContainer;