import React, { useState } from "react";
import "./index.less";

export interface PropTypes {
  stretchItem: "top" | "bottom";
  fixedHeight: string;
  renderTopChild(onHide, onShow, visibility): React.ReactNode;
  renderBottomChild(onHide, onShow, visibility): React.ReactNode;
}

const FlexHorContainer: React.FC<PropTypes> = ({
  stretchItem = "bottom",
  fixedHeight,
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
          marginTop: topVis ? 0 : `-${fixedHeight}`,
          ...(stretchItem === "top"
            ? { bottom: bottomVis ? fixedHeight : 0 }
            : {
                bottom: "unset",
                minHeight: fixedHeight,
                maxHeight: fixedHeight,
                height: fixedHeight,
              }),
        }}
      >
        {renderTopChild(hideTop, showTop, topVis)}
      </div>
      <div
        className="layout-vertical-bottom-container"
        style={{
          marginBottom: bottomVis ? 0 : `-${fixedHeight}`,
          ...(stretchItem === "bottom"
            ? { top: topVis ? fixedHeight : 0 }
            : {
                top: "unset",
                minHeight: fixedHeight,
                maxHeight: fixedHeight,
                height: fixedHeight,
              }),
        }}
      >
        {renderBottomChild(hideBottom, showBottom, bottomVis)}
      </div>
    </div>
  );
};

export default FlexHorContainer;
