import React, { useState, useEffect } from "react";
import FlexHorContainer from "../FlexHorContainer";
import FlexVerContainer from "../FlexVerContainer";
import "./index.less";
import ELKLayout from "../../ELKLayout/ELKLayout";
import PixiDraw from "../../pixijs-render/PixiDraw";
import NodeInfoCard from "../../NodeInfoCard/NodeInfoCard";
import Legend from "../../Legend";
import { useGlobalConfigurations } from "../../../store/global-configuration";

let bottomVisibility = false;
let rightVisibility = false;

export default () => {
  const { pixiJSMode } = useGlobalConfigurations();

  return (
    <FlexHorContainer
      stretchItem="left"
      fixedWidth="200px"
      renderLeftChild={() => (
        <>
          {/* {!webGLMode && <ELKLayout />}
                  {webGLMode && <RenderGraph />} */}
          {!pixiJSMode && <ELKLayout />}
          {pixiJSMode && (
            <PixiDraw
              bottomVisibility={bottomVisibility}
              rightVisibility={rightVisibility}
            />
          )}
        </>
      )}
      renderRightChild={(onHide, onShow, visibility) => (
        <div className="hor-right-wrapper" style={{ height: "100%" }}>
          <div className="expand-btn" onClick={visibility ? onHide : onShow}>
            {(rightVisibility = visibility)}
            {visibility ? (
              <img
                src={process.env.PUBLIC_URL + "/assets/right.svg"}
                alt="收起"
              />
            ) : (
              <img
                src={process.env.PUBLIC_URL + "/assets/left.svg"}
                alt="展开"
              />
            )}
          </div>
          <FlexVerContainer
            fixedHeight="280px"
            stretchItem="top"
            renderTopChild={() => (
              <div className="info-wrapper">
                <div className="panel-title">节点属性</div>
                <NodeInfoCard />
              </div>
            )}
            renderBottomChild={(onHide, onShow, visibility) => (
              <div className="legend-wrapper" style={{ height: "100%" }}>
                <Legend />
                <div
                  className="expand-btn"
                  onClick={visibility ? onHide : onShow}
                >
                  <span className="legend-title">图例</span>
                  <span className="btn">
                    {visibility ? (
                      <img
                        src={process.env.PUBLIC_URL + "/assets/down-b.svg"}
                        alt="收起"
                      />
                    ) : (
                      <img
                        src={process.env.PUBLIC_URL + "/assets/up-b.svg"}
                        alt="展开"
                      />
                    )}
                  </span>
                </div>
              </div>
            )}
          />
        </div>
      )}
    />
  );
};
