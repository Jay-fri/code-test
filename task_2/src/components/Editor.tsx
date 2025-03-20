import React from "react";
import { FileTree } from "./FileTree";
import { CodeEditor } from "./CodeEditor";
import { EditorTabs } from "./EditorTabs";
import { EditorNavBar } from "./EditorNavBar";
import { Breadcrumb } from "./Breadcrumb";

// Sample file content mapping
const fileContents = {
  "/src/App.tsx": `// Your code will appear here
import React from 'react';
import { Prompt } from './components/Prompt';
import { Chat } from './components/Chat';
import { Editor } from './components/Editor';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b">
        <div className="text-xl font-bold text-blue-500">bolt.new</div>
      </header>
      
      <Prompt />
      
      <main className="flex-1 grid grid-cols-2 gap-4 p-4">
        <Chat />
        <Editor />
      </main>
    </div>
  );
}

export default App;`,
  "/src/components/Chat.tsx": `import React from 'react';

export function Chat() {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-medium mb-4">Chat</h2>
      <div className="space-y-4">
        <div className="bg-gray-100 p-3 rounded">
          <p>Hello, how can I help you today?</p>
        </div>
      </div>
    </div>
  );
}`,
  "/src/components/Editor.tsx": `import React from 'react';

export function Editor() {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-medium mb-4">Code Editor</h2>
      <div className="bg-gray-100 p-3 rounded font-mono text-sm">
        <pre>{'function hello() {\n  console.log("Hello world!");\n}'}</pre>
      </div>
    </div>
  );
}`,
  "/src/components/Prompt.tsx": `import React from 'react';

export function Prompt() {
  return (
    <div className="p-4 border-b">
      <div className="relative">
        <input
          type="text"
          className="w-full p-2 pr-10 border rounded"
          placeholder="What would you like to build today?"
        />
        <button className="absolute right-2 top-2 text-blue-500">
          Send
        </button>
      </div>
    </div>
  );
}`,
};

export function Editor() {
  const [code, setCode] = React.useState(fileContents["/src/App.tsx"]);
  const [currentFile, setCurrentFile] = React.useState("/src/App.tsx");

  const handleFileSelect = (path) => {
    setCurrentFile(path);
    // Load the file content based on the selected path
    setCode(fileContents[path] || `// File not found: ${path}`);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    // Update our in-memory file system
    fileContents[currentFile] = newCode;
  };

  return (
    <>
      <EditorTabs />
      <EditorNavBar />
      <div className="h-full flex bg-gray-900">
        <FileTree onFileSelect={handleFileSelect} />
        <div className="flex-1 flex flex-col">
          <Breadcrumb path={currentFile} />
          <CodeEditor
            value={code}
            onChange={handleCodeChange}
            filePath={currentFile}
          />
        </div>
      </div>
    </>
  );
}
