import React from "react";
import FlexHorContainer from "./FlexHorContainer";
import FlexVerContainer from "./FlexVerContainer";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import Header from "./Header";
// const propTypes: PropTypes = {};
// <FlexHorContainer a="123" />;

export default () => {
  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "stretch",
      }}
    >
      <FlexVerContainer
        fixedHeight="64px"
        stretchItem="bottom"
    renderTopChild={() => <div></div>}
        renderBottomChild={() => {
          return (
            <FlexHorContainer
              fixedWidth="360px"
              stretchItem="right"
              renderLeftChild={(onHide, onShow, visibility) => {
                return <Sidebar {...{ onHide, onShow, visibility }} />;
              }}
              renderRightChild={() => <MainContent />}
            />
          );
        }}
      />
    </div>
  );
};
