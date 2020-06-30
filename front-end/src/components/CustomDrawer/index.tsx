import React, { useState, useEffect } from "react";

// 上级节点必须有 position: absolute or relative。
export type PropTypes = {
  // height: string | number;
  position: "left" | "right" | "bottom" | "top";
  style: any;
  children: React.ReactNode;
};

const CustomDrawer: React.FC<PropTypes> = ({
  position,
  children,
  style = {},
}) => {
  const [rootStyle, setRootStyle] = useState({});
  // useEffect(() => {
  //   if () {

  //   }
  // }, [position])
  return (
    <div
      className="custom-drawer"
      style={{
        ...style,
        ...rootStyle,
      }}
    >
      {children}
    </div>
  );
};

export default CustomDrawer;
