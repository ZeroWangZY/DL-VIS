import React from "react";
import "./DagreLayout.css";
import DagreLayoutGraph from "./DagreLayoutGraph"

const DagreLayout: React.FC = () => {

    return (
        <div className="dagre-container">
            <DagreLayoutGraph />
        </div>
    );
}

export default DagreLayout;