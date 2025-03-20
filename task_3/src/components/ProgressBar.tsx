import React from "react";
import { Check } from "lucide-react";
import { useLocation } from "react-router-dom";

const steps = [
  { path: "/upload", label: "Upload" },
  { path: "/recipients", label: "Recipients" },
  { path: "/editor", label: "Editor" },
  { path: "/summary", label: "Summary" },
];

export const ProgressBar: React.FC = () => {
  const location = useLocation();
  const currentStepIndex = steps.findIndex(
    (step) => step.path === location.pathname
  );

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={step.path}
            className="flex flex-col items-center relative flex-1"
          >
            <div
              className={`w-8 h-8 rounded-full z-10 flex items-center justify-center ${
                index <= currentStepIndex
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {index < currentStepIndex ? (
                <Check className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </div>
            <div className="text-sm mt-2">{step.label}</div>
            {index < steps.length - 1 && (
              <div
                className={`absolute z-0 top-4 -right-1/2 h-0.5 w-full ${
                  index < currentStepIndex ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
