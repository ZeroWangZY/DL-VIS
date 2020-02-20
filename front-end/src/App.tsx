import React from "react";
import "./App.css";
import TensorBoardGraph from "./components/tensorboard/Graph";
import DagreLayout from "./components/DagreLayout/DagreLayout";

const App: React.FC = () => {
  return (
    <div className="App">
      {/* <TensorBoardGraph /> */}
      <DagreLayout />
    </div>
  );
};

export default App;
