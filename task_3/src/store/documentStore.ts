import { create } from "zustand";
import { Document, Recipient, DocumentField } from "../types";

interface DocumentStore {
  currentDocument: Document | null;
  documents: Document[];
  previewMode: boolean; // Add preview mode state
  setCurrentDocument: (document: Document | null) => void;
  addDocument: (document: Document) => void;
  updateDocument: (document: Document) => void;
  deleteDocument: (documentId: string) => void;
  addRecipient: (documentId: string, recipient: Recipient) => void;
  removeRecipient: (documentId: string, recipientId: string) => void;
  addField: (documentId: string, field: DocumentField) => void;
  updateField: (documentId: string, field: DocumentField) => void;
  removeField: (documentId: string, fieldId: string) => void;
  setPreviewMode: (isPreview: boolean) => void; // Add setter for preview mode
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  currentDocument: null,
  documents: [],
  previewMode: false, // Default to edit mode

  setCurrentDocument: (document) => set({ currentDocument: document }),

  addDocument: (document) =>
    set((state) => ({ documents: [...state.documents, document] })),

  updateDocument: (document) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === document.id ? document : d
      ),
      currentDocument:
        state.currentDocument?.id === document.id
          ? document
          : state.currentDocument,
    })),

  deleteDocument: (documentId) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== documentId),
      currentDocument:
        state.currentDocument?.id === documentId ? null : state.currentDocument,
    })),

  addRecipient: (documentId, recipient) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === documentId
          ? { ...d, recipients: [...d.recipients, recipient] }
          : d
      ),
      currentDocument:
        state.currentDocument?.id === documentId
          ? {
              ...state.currentDocument,
              recipients: [...state.currentDocument.recipients, recipient],
            }
          : state.currentDocument,
    })),

  removeRecipient: (documentId, recipientId) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === documentId
          ? {
              ...d,
              recipients: d.recipients.filter((r) => r.id !== recipientId),
            }
          : d
      ),
      currentDocument:
        state.currentDocument?.id === documentId
          ? {
              ...state.currentDocument,
              recipients: state.currentDocument.recipients.filter(
                (r) => r.id !== recipientId
              ),
            }
          : state.currentDocument,
    })),

  addField: (documentId, field) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === documentId ? { ...d, fields: [...d.fields, field] } : d
      ),
      currentDocument:
        state.currentDocument?.id === documentId
          ? {
              ...state.currentDocument,
              fields: [...state.currentDocument.fields, field],
            }
          : state.currentDocument,
    })),

  updateField: (documentId, field) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === documentId
          ? {
              ...d,
              fields: d.fields.map((f) => (f.id === field.id ? field : f)),
            }
          : d
      ),
      currentDocument:
        state.currentDocument?.id === documentId
          ? {
              ...state.currentDocument,
              fields: state.currentDocument.fields.map((f) =>
                f.id === field.id ? field : f
              ),
            }
          : state.currentDocument,
    })),

  removeField: (documentId, fieldId) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === documentId
          ? {
              ...d,
              fields: d.fields.filter((f) => f.id !== fieldId),
            }
          : d
      ),
      currentDocument:
        state.currentDocument?.id === documentId
          ? {
              ...state.currentDocument,
              fields: state.currentDocument.fields.filter(
                (f) => f.id !== fieldId
              ),
            }
          : state.currentDocument,
    })),

  setPreviewMode: (isPreview) => set({ previewMode: isPreview }),
}));
