import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Save, GripHorizontal, X, Edit } from "lucide-react";
import { useDocumentStore } from "../store/documentStore";
import { ProgressBar } from "../components/ProgressBar";
import { PDFViewer } from "../components/PDFViewer";
import { EditorSidebar } from "../components/EditorSidebar";
import type { DocumentField } from "../types";

const FIELD_DEFAULT_SIZES = {
  signature: { width: 200, height: 50 },
  text: { width: 200, height: 40 },
  date: { width: 150, height: 40 },
  checkbox: { width: 30, height: 30 },
  initial: { width: 100, height: 50 },
};

export const EditorPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentDocument,
    addField,
    updateDocument,
    removeField,
    updateField,
  } = useDocumentStore();
  const [selectedField, setSelectedField] = useState<DocumentField | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!currentDocument || !pdfContainerRef.current) return;

    const type = e.dataTransfer.getData("fieldType") as DocumentField["type"];
    if (!type) return;

    const rect = pdfContainerRef.current.getBoundingClientRect();

    // Calculate position relative to the PDF viewer, not the container
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newField: DocumentField = {
      id: crypto.randomUUID(),
      type,
      recipientId:
        currentDocument.recipients.length > 0
          ? currentDocument.recipients[0].id
          : "",
      position: {
        x: Math.max(0, Math.min(x, 100)),
        y: Math.max(0, Math.min(y, 100)),
      },
      size: FIELD_DEFAULT_SIZES[type],
      required: true,
      page: currentPage,
      value: "",
    };

    addField(currentDocument.id, newField);
    setSelectedField(newField);

    // Automatically enter edit mode if it's a text field
    if (type === "text") {
      setIsEditing(true);
      setEditValue(newField.value || "");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSave = () => {
    if (currentDocument) {
      // Mark document as pending when saved
      updateDocument({
        ...currentDocument,
        status: "pending",
      });
    }
    navigate("/summary");
  };

  const handleFieldClick = (field: DocumentField, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setSelectedField(field);

    if (field.type === "text" && e.detail === 2) {
      // Double click
      setIsEditing(true);
      setEditValue(field.value || "");
    }
  };

  const handleDeleteField = (fieldId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentDocument) {
      removeField(currentDocument.id, fieldId);
      if (selectedField?.id === fieldId) {
        setSelectedField(null);
      }
    }
  };

  const handleEditField = (fieldId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentDocument) {
      const field = currentDocument.fields.find((f) => f.id === fieldId);
      if (field && field.type === "text") {
        setSelectedField(field);
        setIsEditing(true);
        setEditValue(field.value || "");
      }
    }
  };

  const handleEditSave = () => {
    if (currentDocument && selectedField) {
      const updatedField = {
        ...selectedField,
        value: editValue,
      };
      updateField(currentDocument.id, updatedField);
      setIsEditing(false);
      setSelectedField(null); // Deselect field after saving
    }
  };

  const handleFieldDragStart = (field: DocumentField, e: React.MouseEvent) => {
    e.stopPropagation();

    // Only start dragging if we're clicking on the header bar
    const target = e.target as HTMLElement;
    if (!target.closest(".field-header")) {
      return;
    }

    e.preventDefault();

    if (!pdfContainerRef.current) return;

    const rect = pdfContainerRef.current.getBoundingClientRect();
    setIsDragging(true);
    setSelectedField(field);

    // Calculate field position in pixels
    const fieldX = (field.position.x / 100) * rect.width;
    const fieldY = (field.position.y / 100) * rect.height;

    // Calculate offset from the field's top-left corner
    const offsetX = e.clientX - (rect.left + fieldX);
    const offsetY = e.clientY - (rect.top + fieldY);
    setDragOffset({ x: offsetX, y: offsetY });

    // Add event listeners for mousemove and mouseup
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (
      isDragging &&
      selectedField &&
      currentDocument &&
      pdfContainerRef.current
    ) {
      const rect = pdfContainerRef.current.getBoundingClientRect();

      // Calculate new position based on mouse position and offset
      const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
      const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;

      // Ensure position is within bounds
      const newX = Math.max(0, Math.min(x, 100));
      const newY = Math.max(0, Math.min(y, 100));

      // Update field position
      const updatedField = {
        ...selectedField,
        position: { x: newX, y: newY },
      };

      updateField(currentDocument.id, updatedField);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleBackgroundClick = () => {
    setSelectedField(null);
    setIsEditing(false);
  };

  if (!currentDocument) {
    navigate("/upload");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-4">
        <ProgressBar />
      </div>

      <div className="flex flex-1">
        <EditorSidebar />

        <div className="flex-1 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Document Editor</h2>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
          </div>

          <div
            ref={containerRef}
            className="bg-gray-100 rounded-lg p-4 flex justify-center relative overflow-auto min-h-[600px]"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleBackgroundClick}
          >
            <div ref={pdfContainerRef} className="relative">
              {currentDocument.file && (
                <PDFViewer
                  file={currentDocument.file}
                  pageNumber={currentPage}
                  onPageChange={setCurrentPage}
                  onLoadSuccess={setTotalPages}
                />
              )}

              {isEditing && selectedField && (
                <div
                  style={{
                    position: "absolute",
                    left: `${selectedField.position.x}%`,
                    top: `${selectedField.position.y}%`,
                    width: selectedField.size.width,
                    height: selectedField.size.height,
                    zIndex: 100,
                  }}
                  className="bg-white border-2 border-blue-500 rounded-md shadow-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full h-full p-2 outline-none"
                    autoFocus
                  />
                  <div className="absolute top-0 right-0 flex">
                    <button
                      onClick={handleEditSave}
                      className="bg-blue-500 text-white p-1 text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-500 text-white p-1 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {currentDocument.fields
                .filter(
                  (field) =>
                    field.page === currentPage &&
                    (!isEditing || field.id !== selectedField?.id)
                )
                .map((field) => (
                  <div
                    key={field.id}
                    style={{
                      position: "absolute",
                      left: `${field.position.x}%`,
                      top: `${field.position.y}%`,
                      width: field.size.width,
                      height: field.size.height,
                    }}
                    className={`${
                      selectedField?.id === field.id
                        ? "border-2 border-blue-500"
                        : field.type === "text" && !selectedField
                        ? "border border-gray-200" // Subtle border when not selected for text fields
                        : "border-2 border-gray-400"
                    } bg-white/80 rounded-md shadow-sm`}
                    onClick={(e) => handleFieldClick(field, e)}
                  >
                    {selectedField?.id === field.id ? (
                      // Show edit controls when selected
                      <div className="h-full">
                        <div
                          className="field-header text-xs bg-blue-500 text-white px-2 py-1 flex items-center justify-between rounded-t-sm cursor-move"
                          onMouseDown={(e) => handleFieldDragStart(field, e)}
                        >
                          <span className="capitalize">{field.type}</span>
                          <div className="flex items-center">
                            {field.type === "text" && (
                              <button
                                className="mr-1 p-0.5 hover:bg-blue-600 rounded"
                                onClick={(e) => handleEditField(field.id, e)}
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              className="p-0.5 hover:bg-blue-600 rounded"
                              onClick={(e) => handleDeleteField(field.id, e)}
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <GripHorizontal className="w-3 h-3 ml-1" />
                          </div>
                        </div>
                        {field.type === "text" && (
                          <div className="p-2 text-sm">
                            {field.value || "Enter text here"}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Just show the content when not selected
                      <div className="h-full">
                        {field.type === "text" ? (
                          // For text fields, show the content or placeholder
                          <div className="p-2 text-sm h-full">
                            {field.value || "Enter text here"}
                          </div>
                        ) : (
                          // For other fields, show a label
                          <div className="h-full">
                            <div className="field-header text-xs bg-gray-400 text-white px-2 py-1 rounded-t-sm">
                              <span className="capitalize">{field.type}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
