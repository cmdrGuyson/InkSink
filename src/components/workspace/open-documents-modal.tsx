"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Calendar, Clock, Search } from "lucide-react";
import { observer } from "mobx-react-lite";
import { useState, useMemo } from "react";

interface OpenDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDocument: (documentId: string) => void;
  documents: Array<{
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
  }>;
  loading: boolean;
}

export const OpenDocumentsModal = observer(
  ({
    isOpen,
    onClose,
    onOpenDocument,
    documents,
    loading,
  }: OpenDocumentsModalProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredDocuments = useMemo(() => {
      if (!searchQuery.trim()) return documents;
      return documents.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [documents, searchQuery]);

    const formatRelativeDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

        if (diffInDays > 0) {
          return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
        } else if (diffInHours > 0) {
          return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
        } else if (diffInMinutes > 0) {
          return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
        } else {
          return "Just now";
        }
      } catch {
        return "Unknown";
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Documents
            </DialogTitle>
            <DialogDescription>
              Select a document to open and continue your work
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-0 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>
                    {searchQuery
                      ? "No documents match your search"
                      : "No documents found"}
                  </p>
                  <p className="text-sm">
                    {searchQuery
                      ? "Try a different search term"
                      : "Create your first document to get started"}
                  </p>
                </div>
              ) : (
                filteredDocuments.map((document, index) => (
                  <div
                    key={document.id}
                    className={`cursor-pointer hover:bg-accent/50 transition-colors px-3 py-3 ${
                      index !== filteredDocuments.length - 1
                        ? "border-b border-border/50"
                        : ""
                    }`}
                    onClick={() => onOpenDocument(document.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {document.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Created {formatRelativeDate(document.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Updated {formatRelativeDate(document.updated_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <FileText className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
