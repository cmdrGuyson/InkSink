import {
  DocumentInsert,
  DocumentService,
  PartialDocument,
  Document,
} from "@/services/document.service";
import { makeAutoObservable, runInAction } from "mobx";

class DocumentStore {
  loading: boolean = false;
  error: string | null = null;
  documents: PartialDocument[] = [];

  loadingSelectedDocument: boolean = false;
  selectedDocument: Document | null = null;

  constructor() {
    makeAutoObservable(this);

    // Automatically fetch projects when store is initialized
    this.fetchDocuments();
  }

  async fetchDocuments() {
    this.loading = true;
    this.error = null;
    try {
      const documents = await DocumentService.getAllUserDocuments();
      runInAction(() => {
        this.documents = documents;
        this.loading = false;
      });
    } catch (e: unknown) {
      runInAction(() => {
        this.error =
          e instanceof Error ? e.message : "Failed to fetch documents";
        this.loading = false;
      });
    }
  }

  async createDocument(data: DocumentInsert) {
    this.error = null;
    try {
      const document = await DocumentService.createDocument(data);
      runInAction(() => {
        this.documents.unshift(document);
      });
      return document;
    } catch (e: unknown) {
      runInAction(() => {
        this.error =
          e instanceof Error ? e.message : "Failed to create document";
      });
      throw e;
    }
  }

  async getDocumentById(id: string) {
    this.loadingSelectedDocument = true;
    this.error = null;
    try {
      const document = await DocumentService.getDocumentById(id);
      runInAction(() => {
        this.selectedDocument = document;
        this.loadingSelectedDocument = false;
      });
    } catch (e: unknown) {
      runInAction(() => {
        this.error =
          e instanceof Error ? e.message : "Failed to fetch document";
        this.loadingSelectedDocument = false;
      });
    }
  }

  async updateDocument(id: string, data: { title?: string; content?: string }) {
    this.error = null;
    try {
      const updatedDocument = await DocumentService.updateDocument(id, data);

      runInAction(() => {
        // Update selected document if it's the one being updated
        if (this.selectedDocument?.id === id) {
          this.selectedDocument = updatedDocument;
        }

        // Update document in the documents list
        const documentIndex = this.documents.findIndex((doc) => doc.id === id);
        if (documentIndex !== -1) {
          this.documents[documentIndex] = {
            ...this.documents[documentIndex],
            title: updatedDocument.title,
            updated_at: updatedDocument.updated_at,
          };
        }
      });

      return updatedDocument;
    } catch (e: unknown) {
      runInAction(() => {
        this.error =
          e instanceof Error ? e.message : "Failed to update document";
      });
      throw e;
    }
  }
}

export const documentStore = new DocumentStore();
