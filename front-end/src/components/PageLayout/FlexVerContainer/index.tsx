import React, { useState } from "react";
import "./index.less";

export interface PropTypes {
  stretchItem: "top" | "bottom";
  fixedTopHeight: string;
  fixedBottomHeight: string;
  renderTopChild(onHide, onShow, visibility): React.ReactNode;
  renderBottomChild(onHide, onShow, visibility): React.ReactNode;
}

const FlexHorContainer: React.FC<PropTypes> = ({
  stretchItem = "bottom",
  fixedTopHeight,
  fixedBottomHeight,
  renderTopChild,
  renderBottomChild,
}) => {
  const [topVis, setTopVis] = useState(true);
  const [bottomVis, setBottomVis] = useState(true);
  const hideTop = setTopVis.bind(null, false);
  const showTop = setTopVis.bind(null, true);
  const hideBottom = setBottomVis.bind(null, false);
  const showBottom = setBottomVis.bind(null, true);
  return (
    <div className="layout-vertical">
      <div
        className="layout-vertical-top-container"
        style={{
          marginTop: topVis ? 0 : `-${fixedTopHeight}`,
          ...(stretchItem === "top"
            ? { bottom: bottomVis ? fixedTopHeight : 0 }
            : {
                bottom: "unset",
                minHeight: fixedTopHeight,
                maxHeight: fixedTopHeight,
                height: fixedTopHeight,
              }),
        }}
      >
        {renderTopChild(hideTop, showTop, topVis)}
      </div>
      <div
        className="layout-vertical-bottom-container"
        style={{
          marginBottom: bottomVis ? 0 : `-${fixedBottomHeight}`,
          ...(stretchItem === "bottom"
            ? { top: topVis ? fixedBottomHeight : 0 }
            : {
                top: "unset",
                minHeight: fixedBottomHeight,
                maxHeight: fixedBottomHeight,
                height: fixedBottomHeight,
              }),
        }}
      >
        {renderBottomChild(hideBottom, showBottom, bottomVis)}
      </div>
    </div>
  );
};

export default FlexHorContainer;
