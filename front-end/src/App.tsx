import React from "react";
import "./App.css";
import TensorBoardGraph from "./components/tensorboard/Graph";

const App: React.FC = () => {
  return (
    <div className="App">
      <TensorBoardGraph />
    </div>
  );
};

export default App;
