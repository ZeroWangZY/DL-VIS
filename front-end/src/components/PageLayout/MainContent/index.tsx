import React, { useState, useEffect } from "react";
import FlexHorContainer from "../FlexHorContainer";
import FlexVerContainer from "../FlexVerContainer";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./index.less";
import LayerLevel from "../../LayerLevel/LayerLevel";
import ELKLayout from "../../ELKLayout/ELKLayout";
import RenderGraph from "../../threejs-render/RenderGraph";
import PixiDraw from "../../pixijs-render/PixiDraw";
import NodeInfoCard from "../../NodeInfoCard/NodeInfoCard";
import Legend from "../../Legend";
import DanymicInfo from "../../DynamicInfo";
import {
  useGlobalConfigurations
} from "../../../store/global-configuration";

let bottomVisibility = false;
let rightVisibility = false;

export default () => {
  const [fixedHeight, setFixedHeight] = useState("360px");
  const { conceptualGraphMode, webGLMode, pixiJSMode } = useGlobalConfigurations();

  return (
    <Router>
      <FlexVerContainer
        fixedTopHeight="0px"
        fixedBottomHeight="0px"
        stretchItem="top"
        renderBottomChild={(onHide, onShow, visibility) => {
          return (
            <div className="vertical-bottom-wrapper">
              {/* <DanymicInfo setFixedHeight={setFixedHeight} />
              <div
                className="expand-btn"
                onClick={visibility ? onHide : onShow}
              >
                {bottomVisibility = visibility}
                {visibility ? (
                  <img
                    src={process.env.PUBLIC_URL + "/assets/down.svg"}
                    alt="收起"
                  />
                ) : (
                    <img
                      src={process.env.PUBLIC_URL + "/assets/up.svg"}
                      alt="展开"
                    />
                  )}
              </div> */}
            </div>
          );
        }}
        renderTopChild={() => (
          <FlexHorContainer
            stretchItem="left"
            fixedWidth="280px"
            renderLeftChild={() => (
              <Switch>
                <Route path="/layer">
                  <LayerLevel />
                </Route>
                <Route path="/">
                  {/* {!webGLMode && <ELKLayout />}
                  {webGLMode && <RenderGraph />} */}
                  {!pixiJSMode && <ELKLayout />}
                  {pixiJSMode && <PixiDraw
                    bottomVisibility={bottomVisibility}
                    rightVisibility={rightVisibility} />}
                </Route>
              </Switch>
            )}
            renderRightChild={(onHide, onShow, visibility) => (
              <div className="hor-right-wrapper" style={{ height: "100%" }}>
                <div
                  className="expand-btn"
                  onClick={visibility ? onHide : onShow}
                >
                  {rightVisibility = visibility}
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
                  fixedTopHeight="460px"
                  fixedBottomHeight="420px"
                  stretchItem="top"
                  renderTopChild={() => (
                    <div className="info-wrapper">
                      <div className="panel-title">Node Information</div>
                      <NodeInfoCard />
                    </div>
                  )}
                  renderBottomChild={(onHide, onShow, visibility) => (
                    <div className="legend-wrapper" style={{ height: "100%" }}>
                      <span className="legend-title">Legend</span>
                      <Legend />
                    </div>
                  )}
                />
              </div>
            )}
          />
        )}
      />
    </Router>
  );
};
