import React from "react";
import FlexHorContainer from "../FlexHorContainer";
import FlexVerContainer from "../FlexVerContainer";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./index.less";
import LayerLevel from "../../LayerLevel/LayerLevel";
import ELKLayout from "../../ELKLayout/ELKLayout";
import {
  useGlobalConfigurations,
  modifyGlobalConfigurations,
} from "../../../store/global-configuration";
import NodeInfoCard from "../../NodeInfoCard/NodeInfoCard";
import Legend from "../../Legend";
import DanymicInfo from "../../DynamicInfo";

export default () => {

  return (
    <Router>
      <FlexVerContainer
        fixedHeight="360px"
        stretchItem="top"
        renderBottomChild={(onHide, onShow, visibility) => {
          return (
            <div className="vertical-bottom-wrapper">
              <DanymicInfo />
              <div
                className="expand-btn"
                onClick={visibility ? onHide : onShow}
              >
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
              </div>
            </div>
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
                  <ELKLayout />
                </Route>
              </Switch>
            )}
            renderRightChild={(onHide, onShow, visibility) => (
              <div className="hor-right-wrapper" style={{ height: "100%" }}>
                <div
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
