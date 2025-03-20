import React from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  filePath?: string; // Made optional to maintain compatibility
}

export function CodeEditor({
  value,
  onChange,
  filePath = "/src/App.tsx",
}: CodeEditorProps) {
  const lines = value.split("\n");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [highlighted, setHighlighted] = React.useState("");

  // Determine language based on file extension
  const getLanguage = (path: string) => {
    const extension = path.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "tsx":
        return "tsx";
      case "jsx":
        return "jsx";
      case "ts":
        return "typescript";
      case "js":
        return "javascript";
      case "css":
        return "css";
      case "html":
        return "html";
      default:
        return "tsx";
    }
  };

  const language = getLanguage(filePath);

  React.useEffect(() => {
    if (!value) return;

    try {
      const grammar = Prism.languages[language] || Prism.languages.tsx;
      const highlighted = Prism.highlight(value, grammar, language);
      setHighlighted(highlighted);
    } catch (error) {
      console.error("Syntax highlighting error:", error);
      setHighlighted(value);
    }
  }, [value, language]);

  return (
    <div className="relative h-full bg-gray-900 text-gray-300 font-mono text-sm">
      <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col items-end pr-2 pt-4 text-gray-500 select-none bg-gray-900 border-r border-gray-800">
        {lines.map((_, i) => (
          <div key={i} className="leading-6">
            {i + 1}
          </div>
        ))}
      </div>
      <div className="absolute left-12 right-0 top-0 bottom-0 overflow-auto">
        <pre className="m-0 p-4">
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute left-0 top-0 w-full h-full pl-4 pt-4 bg-transparent resize-none focus:outline-none leading-6 text-transparent caret-white font-mono text-sm"
          style={{
            fontFamily: "inherit",
            fontSize: "inherit",
            lineHeight: "inherit",
            tabSize: 2,
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
