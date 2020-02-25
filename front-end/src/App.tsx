import React from "react";
import "./App.css";
import AppEntry from './components/AppEntry'
import { TestProcessedGraphProvider } from "./hooks/useTestData";

const App: React.FC = () => {
  return (
    <TestProcessedGraphProvider>
      <div className="App">
        <AppEntry />
      </div>
    </TestProcessedGraphProvider>

  );
};

export default App;
