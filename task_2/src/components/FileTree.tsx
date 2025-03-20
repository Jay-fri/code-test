import React from "react";
import { ChevronDown, File, Folder } from "lucide-react";

interface FileTreeProps {
  onFileSelect: (path: string) => void;
}

export function FileTree({ onFileSelect }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(
    new Set(["src", "components"])
  );
  const [selectedFile, setSelectedFile] =
    React.useState<string>("/src/App.tsx");

  const toggleFolder = (folder: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folder)) {
        next.delete(folder);
      } else {
        next.add(folder);
      }
      return next;
    });
  };

  const handleFileSelect = (path: string) => {
    setSelectedFile(path);
    onFileSelect(path); // Call the passed onFileSelect function
  };

  return (
    <div className="h-full w-64 bg-gray-900 text-gray-300 border-r border-gray-800">
      <div
        className="flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-gray-800"
        onClick={(e) => toggleFolder("src", e)}
      >
        <span className="flex items-center gap-1">
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedFolders.has("src") ? "" : "-rotate-90"
            }`}
          />
          <Folder className="w-4 h-4" />
          src
        </span>
      </div>
      {expandedFolders.has("src") && (
        <div className="pl-4">
          <div
            className="flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-gray-800"
            onClick={(e) => toggleFolder("components", e)}
          >
            <span className="flex items-center gap-1">
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  expandedFolders.has("components") ? "" : "-rotate-90"
                }`}
              />
              <Folder className="w-4 h-4" />
              components
            </span>
          </div>
          {expandedFolders.has("components") && (
            <div className="pl-4">
              <div
                className="flex items-center gap-2 p-2 text-sm text-gray-400 cursor-pointer hover:bg-gray-800"
                onClick={() => handleFileSelect("/src/components/Chat.tsx")}
              >
                <File className="w-4 h-4" />
                Chat.tsx
              </div>
              <div
                className="flex items-center gap-2 p-2 text-sm text-gray-400 cursor-pointer hover:bg-gray-800"
                onClick={() => handleFileSelect("/src/components/Editor.tsx")}
              >
                <File className="w-4 h-4" />
                Editor.tsx
              </div>
              <div
                className="flex items-center gap-2 p-2 text-sm text-gray-400 cursor-pointer hover:bg-gray-800"
                onClick={() => handleFileSelect("/src/components/Prompt.tsx")}
              >
                <File className="w-4 h-4" />
                Prompt.tsx
              </div>
            </div>
          )}
          <div
            className={`flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-gray-800 ${
              selectedFile === "/src/App.tsx"
                ? "bg-gray-800 border-l-2 border-blue-500"
                : ""
            }`}
            onClick={() => handleFileSelect("/src/App.tsx")}
          >
            <File className="w-4 h-4" />
            App.tsx
          </div>
        </div>
      )}
    </div>
  );
}
