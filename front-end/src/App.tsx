import React from "react";
import "./App.css";
import TensorBoardGraph from "./components/tensorboard/Graph";
import RenderGraph from './components/threejs-render/RenderGraph'

const App: React.FC = () => {
  return (
    <div className="App">
      {/* <TensorBoardGraph /> */}
      <RenderGraph/>
    </div>
  );
};

export default App;
