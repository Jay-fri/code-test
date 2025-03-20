import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UploadPage } from "./pages/UploadPage";
import { RecipientsPage } from "./pages/RecipientsPage";
import { EditorPage } from "./pages/EditorPage";
import { SummaryPage } from "./pages/SummaryPage";
import { SigningPage } from "./pages/SigningPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Navigate to="/upload" replace />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/recipients" element={<RecipientsPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/signing/:documentId" element={<SigningPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
