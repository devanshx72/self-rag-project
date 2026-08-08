import { create } from "zustand";
import { DocumentMeta } from "@/types";
import { fetchDocuments, uploadDocument, deleteDocument } from "@/lib/api";

interface DocumentState {
  documents: DocumentMeta[];
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;

  loadDocuments: () => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  removeDocument: (id: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  isLoading: false,
  isUploading: false,
  error: null,

  loadDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const docs = await fetchDocuments();
      set({ documents: docs, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load documents", isLoading: false });
    }
  },

  uploadFile: async (file: File) => {
    set({ isUploading: true, error: null });
    try {
      await uploadDocument(file);
      await get().loadDocuments();
      set({ isUploading: false });
    } catch (err: any) {
      set({ error: err.message || "Upload failed", isUploading: false });
    }
  },

  removeDocument: async (id: string) => {
    try {
      await deleteDocument(id);
      await get().loadDocuments();
    } catch (err: any) {
      set({ error: err.message || "Delete failed" });
    }
  },
}));
