import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDocumentStore } from "../store/documentStore";
import { PDFViewer } from "../components/PDFViewer";
import { SigningField } from "../components/SigningField";

export const SigningPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { documents, updateDocument } = useDocumentStore();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);

  const document = documents.find((d) => d.id === documentId);

  if (!document) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Document not found</div>
      </div>
    );
  }

  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleComplete = () => {
    const updatedDocument = {
      ...document,
      status: "completed" as const,
      fields: document.fields.map((field) => ({
        ...field,
        value: fieldValues[field.id] || "",
      })),
    };
    updateDocument(updatedDocument);
    navigate("/summary");
  };

  const allFieldsFilled = document.fields
    .filter((f) => f.required)
    .every((f) => fieldValues[f.id]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">
          Sign Document: {document.name}
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="relative">
            {document.file && (
              <PDFViewer
                file={document.file}
                pageNumber={currentPage}
                onPageChange={setCurrentPage}
              />
            )}
            {document.fields
              .filter((field) => field.page === currentPage)
              .map((field) => (
                <SigningField
                  key={field.id}
                  field={field}
                  onChange={handleFieldChange}
                />
              ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleComplete}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete Signing
          </button>
        </div>
      </div>
    </div>
  );
};
