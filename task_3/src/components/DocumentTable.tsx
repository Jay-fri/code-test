import React from "react";
import { useNavigate } from "react-router-dom";
import { Send, Eye, Trash2 } from "lucide-react";
import { Document } from "../types";
import { formatDate } from "../utils/dateUtils";

interface DocumentTableProps {
  documents: Document[];
  onDelete: (documentId: string) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  onDelete,
}) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Document
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Upload Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recipients
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {doc.name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {formatDate(doc.uploadDate)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${
                    doc.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : doc.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {doc.recipients.length} recipient(s)
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  onClick={() => navigate(`/signing/${doc.id}`)}
                  className="text-blue-600 hover:text-blue-900"
                  title="Send for signing"
                >
                  <Send className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    // Navigate to editor and set this as current document
                    navigate(`/editor`);
                  }}
                  className="text-gray-600 hover:text-gray-900"
                  title="View/Edit document"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(doc.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
