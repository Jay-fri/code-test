import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useDocumentStore } from "../store/documentStore";
import { DocumentTable } from "../components/DocumentTable";

export const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { documents, setCurrentDocument, updateDocument } = useDocumentStore();

  const handleDeleteDocument = (documentId: string) => {
    // In a real app you would implement proper deletion
    // For now, we'll just log it
    console.log("Delete document:", documentId);
    // You could add a modal confirmation here
  };

  const handleViewDocument = (documentId: string) => {
    const document = documents.find((doc) => doc.id === documentId);
    if (document) {
      setCurrentDocument(document);
      navigate("/editor");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <button
          onClick={() => navigate("/upload")}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Document
        </button>
      </div>

      {documents.length > 0 ? (
        <DocumentTable documents={documents} onDelete={handleDeleteDocument} />
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">
            No documents yet. Start by uploading a new document.
          </p>
        </div>
      )}
    </div>
  );
};
