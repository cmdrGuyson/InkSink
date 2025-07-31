import {
  DocumentInsert,
  DocumentService,
  PartialDocument,
} from "@/services/document.service";
import { makeAutoObservable, runInAction } from "mobx";

class DocumentStore {
  loading: boolean = false;
  error: string | null = null;
  documents: PartialDocument[] = [];

  loadingSelectedDocument: boolean = false;
  selectedDocument: PartialDocument | null = null;

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
}

export const documentStore = new DocumentStore();
