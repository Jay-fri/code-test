import React from "react";
import { FlowProvider } from "./context/FlowContext";
import { Sidebar } from "./components/Sidebar";

function App() {
  return (
    <div className="w-full h-screen">
      <FlowProvider>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 bg-white" />
        </div>
      </FlowProvider>
    </div>
  );
}

export default App;
