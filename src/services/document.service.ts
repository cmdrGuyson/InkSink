import { createClient } from "@/lib/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

export type Document = Tables<"document">;
export type DocumentInsert = TablesInsert<"document">;
export type DocumentUpdate = TablesUpdate<"document">;
export type PartialDocument = Pick<
  Document,
  "id" | "title" | "user_id" | "created_at" | "updated_at"
>;

// Error types for better error handling
export class DocumentServiceError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "DocumentServiceError";
  }
}

const supabase = createClient();

export class DocumentService {
  /**
   * Create a new document
   * @param documentData - Document data to insert
   * @returns Created document
   */
  static async createDocument(
    documentData: Omit<DocumentInsert, "user_id" | "created_at" | "updated_at">
  ): Promise<Document> {
    try {
      const insertData: DocumentInsert = {
        ...documentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("document")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw new DocumentServiceError(
          `Failed to create: ${error.message}`,
          error.code
        );
      }

      if (!data) {
        throw new DocumentServiceError("No data returned after creation");
      }

      return data;
    } catch (error) {
      if (error instanceof DocumentServiceError) {
        throw error;
      }
      throw new DocumentServiceError(
        `Unexpected error creating: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get a document by ID
   * @param documentId - Document ID to retrieve
   * @returns Document data
   */
  static async getDocumentById(documentId: string): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from("document")
        .select("*")
        .eq("id", documentId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new DocumentServiceError("Not found", "NOT_FOUND");
        }
        throw new DocumentServiceError(
          `Failed to retrieve: ${error.message}`,
          error.code
        );
      }

      if (!data) {
        throw new DocumentServiceError("Not found", "NOT_FOUND");
      }

      return data;
    } catch (error) {
      if (error instanceof DocumentServiceError) {
        throw error;
      }
      throw new DocumentServiceError(
        `Unexpected error retrieving data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get all documents for the current user
   * @returns Array of documents
   */
  static async getAllUserDocuments(): Promise<PartialDocument[]> {
    try {
      const { data, error } = await supabase
        .from("document")
        .select("id, title, user_id, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (error) {
        throw new DocumentServiceError(
          `Failed to retrieve data: ${error.message}`,
          error.code
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof DocumentServiceError) {
        throw error;
      }
      throw new DocumentServiceError(
        `Unexpected error retrieving data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update a document by ID
   * @param documentId - Document ID to update
   * @param updateData - Data to update
   * @returns Updated document
   */
  static async updateDocument(
    documentId: string,
    updateData: Partial<Pick<DocumentUpdate, "title" | "content">>
  ): Promise<Document> {
    try {
      const updatePayload: DocumentUpdate = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("document")
        .update(updatePayload)
        .eq("id", documentId)
        .select()
        .single();

      if (error) {
        throw new DocumentServiceError(
          `Failed to update: ${error.message}`,
          error.code
        );
      }

      if (!data) {
        throw new DocumentServiceError("No data returned after update");
      }

      return data;
    } catch (error) {
      if (error instanceof DocumentServiceError) {
        throw error;
      }
      throw new DocumentServiceError(
        `Unexpected error updating: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
