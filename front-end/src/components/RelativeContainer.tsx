import React from "react";
export interface PropTypes {
  className?: string;
  style?: any;
  children: React.ReactNode;
}
const RelativeContainer: React.FC<PropTypes> = ({
  className,
  children,
  style,
}) => {
  return (
    <div
      className={className}
      style={{
        ...style,
        position: "relative",
      }}
    >
      {children}
    </div>
  );
};

export default RelativeContainer;
