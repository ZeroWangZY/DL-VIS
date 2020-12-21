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

export default () => {
  const [fixedHeight, setFixedHeight] = useState("360px");
  const { conceptualGraphMode, webGLMode, pixiJSMode } = useGlobalConfigurations();

  return (
    <Router>
      <FlexVerContainer
        fixedHeight={fixedHeight}
        stretchItem="top"
        renderBottomChild={(onHide, onShow, visibility) => {
          return (<div></div>
            // <div className="vertical-bottom-wrapper">
            //   <DanymicInfo setFixedHeight={setFixedHeight} />
            //   <div
            //     className="expand-btn"
            //     onClick={visibility ? onHide : onShow}
            //   >
            //     {visibility ? (
            //       <img
            //         src={process.env.PUBLIC_URL + "/assets/down.svg"}
            //         alt="收起"
            //       />
            //     ) : (
            //         <img
            //           src={process.env.PUBLIC_URL + "/assets/up.svg"}
            //           alt="展开"
            //         />
            //       )}
            //   </div>
            // </div>
          );
        }}
        renderTopChild={() => (
          <FlexHorContainer
            stretchItem="left"
            fixedWidth="200px"
            renderLeftChild={() => (
              <Switch>
                <Route path="/layer">
                  <LayerLevel />
                </Route>
                <Route path="/">
                  {/* {!webGLMode && <ELKLayout />}
                  {webGLMode && <RenderGraph />} */}
                  {!pixiJSMode && <ELKLayout />}
                  {pixiJSMode && <PixiDraw />}
                </Route>
              </Switch>
            )}
            renderRightChild={(onHide, onShow, visibility) => (
              <div className="hor-right-wrapper" style={{ height: "100%" }}>
                {/* <div
                  className="expand-btn"
                  onClick={visibility ? onHide : onShow}
                >
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
                </div> */}
                <FlexVerContainer
                  fixedHeight="280px"
                  stretchItem="top"
                  renderTopChild={() => (
                    <div className="info-wrapper">
                      <div className="panel-title">节点属性面板</div>
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
                              src={
                                process.env.PUBLIC_URL + "/assets/down-b.svg"
                              }
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
        )}
      />
    </Router>
  );
};
