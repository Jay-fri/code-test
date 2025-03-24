import React from "react";
import { PenLine, Type, Calendar, CheckSquare, Edit } from "lucide-react";
import { DocumentField } from "../types";

interface SigningFieldProps {
  field: DocumentField;
  onChange: (fieldId: string, value: string) => void;
}

const fieldIcons = {
  signature: PenLine,
  text: Type,
  date: Calendar,
  checkbox: CheckSquare,
  initial: Edit,
};

export const SigningField: React.FC<SigningFieldProps> = ({
  field,
  onChange,
}) => {
  const Icon = fieldIcons[field.type];

  const renderInput = () => {
    switch (field.type) {
      case "signature":
      case "initial":
        return field.value ? (
          <div className="w-full h-full p-2 flex items-center justify-center border border-gray-300 rounded bg-blue-50">
            <span className="italic text-blue-600 font-medium">
              {field.value}
            </span>
          </div>
        ) : (
          <button
            className="w-full h-full min-h-[40px] border-2 border-dashed border-blue-500 rounded flex items-center justify-center text-blue-600 hover:bg-blue-50"
            onClick={() => onChange(field.id, "Signed")}
          >
            <Icon className="w-5 h-5 mr-2" />
            Click to {field.type}
          </button>
        );
      case "date":
        return (
          <input
            type="date"
            value={field.value || ""}
            onChange={(e) => onChange(field.id, e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={field.value === "true"}
            onChange={(e) =>
              onChange(field.id, e.target.checked ? "true" : "false")
            }
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
        );
      case "text":
        return field.value ? (
          <div className="w-full h-full p-2 text-gray-800">{field.value}</div>
        ) : (
          <input
            type="text"
            placeholder={`Enter ${field.type}`}
            onChange={(e) => onChange(field.id, e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      default:
        return (
          <input
            type="text"
            value={field.value || ""}
            onChange={(e) => onChange(field.id, e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Enter ${field.type}`}
          />
        );
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        left: `${field.position.x}%`, // Use percentage for responsive positioning
        top: `${field.position.y}%`, // Use percentage for responsive positioning
        width: field.size.width,
        height: field.size.height,
      }}
      className="bg-white shadow-sm"
    >
      {renderInput()}
      {field.required && !field.value && (
        <span className="absolute -top-2 -right-2 text-red-500">*</span>
      )}
    </div>
  );
};
