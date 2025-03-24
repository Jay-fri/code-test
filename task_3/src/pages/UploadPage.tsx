import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { Upload, File, X } from "lucide-react";
import { useDocumentStore } from "../store/documentStore";
import { ProgressBar } from "../components/ProgressBar";

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { addDocument, setCurrentDocument } = useDocumentStore();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setUploadedFile(file);

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

  const removeFile = () => {
    setUploadedFile(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const handleNext = () => {
    navigate("/recipients", { state: { fromUpload: true } });
  };

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

        {/* Display uploaded file */}
        {uploadedFile && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
            <div className="flex items-center">
              <File className="w-6 h-6 text-blue-500 mr-3" />
              <div>
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {Math.round(uploadedFile.size / 1024)} KB
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="p-1 hover:bg-gray-200 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}

        <button
          onClick={handleNext}
          className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          disabled={!uploadedFile}
        >
          Next
        </button>
      </div>
    </div>
  );
};
