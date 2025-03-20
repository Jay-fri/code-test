import React from "react";
import { PenLine, Type, Calendar, CheckSquare, Edit } from "lucide-react";
import { DocumentField } from "../types";

interface DraggableFieldProps {
  type: DocumentField["type"];
}

const fieldIcons = {
  signature: PenLine,
  text: Type,
  date: Calendar,
  checkbox: CheckSquare,
  initial: Edit,
};

export const DraggableField: React.FC<DraggableFieldProps> = ({ type }) => {
  const Icon = fieldIcons[type];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("fieldType", type);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-center p-3 mb-2 bg-white rounded-lg shadow-sm cursor-move hover:bg-gray-50 transition-colors"
    >
      <Icon className="w-5 h-5 mr-2 text-blue-600" />
      <span className="capitalize">{type}</span>
    </div>
  );
};
