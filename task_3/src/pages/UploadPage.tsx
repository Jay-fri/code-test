import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { useDocumentStore } from "../store/documentStore";
import { ProgressBar } from "../components/ProgressBar";

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { addDocument, setCurrentDocument } = useDocumentStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const newDocument = {
          id: crypto.randomUUID(),
          name: file.name,
          uploadDate: new Date(),
          status: "draft" as const,
          recipients: [],
          fields: [],
          file,
        };
        addDocument(newDocument);
        setCurrentDocument(newDocument);
      }
    },
    [addDocument, setCurrentDocument]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressBar />
      <div className="max-w-2xl mx-auto">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-xl mb-2">
            {isDragActive
              ? "Drop your PDF here"
              : "Drag and drop your PDF here, or click to select"}
          </p>
          <p className="text-sm text-gray-500">Supported format: PDF</p>
        </div>
        <button
          onClick={() => navigate("/recipients")}
          className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};
