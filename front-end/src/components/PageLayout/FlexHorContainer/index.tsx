import React, { useState } from "react";
import "./index.less";

export interface PropTypes {
  stretchItem: "left" | "right";
  fixedWidth: string;
  renderLeftChild(onHide, onShow, visibility): React.ReactNode;
  renderRightChild(onHide, onShow, visibility): React.ReactNode;
}

const FlexHorContainer: React.FC<PropTypes> = ({
  stretchItem = "right",
  fixedWidth,
  renderLeftChild,
  renderRightChild,
}) => {
  const [leftVis, setLeftVis] = useState(true);
  const [rightVis, setRightVis] = useState(true);
  const hideLeft = setLeftVis.bind(null, false);
  const showLeft = setLeftVis.bind(null, true);
  const hideRight = setRightVis.bind(null, false);
  const showRight = setRightVis.bind(null, true);
  return (
    <div className="layout-horizontal">
      <div
        className="layout-horizontal-left-container"
        style={{
          marginLeft: leftVis ? 0 : `-${fixedWidth}`,
          ...(stretchItem === "left"
            ? {
                flex: 1,
              }
            : {
                // minWidth: fixedWidth,
                // maxWidth: fixedWidth,
                width: 320,
              }),
        }}
      >
        {/* <div
          style={{
            position:"absolute",
            textAlign: 'center',
            background: '#eee',
            fontSize: 15,
            border: '1px solid#333',
            lineHeight: 40,
          }}
        >计算图面板</div> */}
        {renderLeftChild(hideLeft, showLeft, leftVis)}
      </div>
      <div
        className="layout-horizontal-right-container"
        style={{
          marginRight: rightVis ? 0 : `-${fixedWidth}`,
          ...(stretchItem === "right"
            ? { flex: 1 }
            : {
                minWidth: fixedWidth,
                // maxWidth: fixedWidth,
                width: 320,
              }),
        }}
      >
        {renderRightChild(hideRight, showRight, rightVis)}
      </div>
    </div>
  );
};

export default FlexHorContainer;
