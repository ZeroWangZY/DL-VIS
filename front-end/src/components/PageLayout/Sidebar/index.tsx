import React from "react";
import "./index.less";
// import Divider from "@material-ui/core/Divider";
import GraphSelector from "../../preference/GraphSelector";
import NodeSelector from "../../preference/NodeSelector";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

export interface PropTypes {
  onHide(): void;
  onShow(): void;
  visibility: boolean;
}

export const Sidebar: React.FC<PropTypes> = ({
  onHide,
  onShow,
  visibility,
}) => {
  return (
    <div className="sidebar-wrapper">
      <div className="panel-title">节点信息</div>
      <div className="vis-graphselector">
        {/* <Divider /> */}
        <GraphSelector />
      </div>
      {/* <Divider /> */}
      <NodeSelector />
      <div className="expand-btn" onClick={visibility ? onHide : onShow}>
        {visibility ? (
          <img src={process.env.PUBLIC_URL + "/assets/left.svg"} alt="收起" />
        ) : (
          <img src={process.env.PUBLIC_URL + "/assets/right.svg"} alt="展开" />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
