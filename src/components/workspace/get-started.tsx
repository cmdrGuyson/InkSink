"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderOpen, FileText } from "lucide-react";

export const GetStarted = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center pb-3">
          <CardTitle className="text-lg font-semibold font-mono">
            Welcome to InkSink
          </CardTitle>
          <CardDescription className="text-sm">
            Start writing or open an existing document to continue your work
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9 text-sm"
            onClick={() => {
              // Handle open document functionality
              console.log("Open document clicked");
            }}
          >
            <FolderOpen className="h-3 w-3 mr-2" />
            Open Recent Document
          </Button>
          <Button
            size="sm"
            className="w-full h-9 text-sm"
            onClick={() => {
              // Handle new document functionality
              console.log("New document clicked");
            }}
          >
            <FileText className="h-3 w-3 mr-2" />
            Create New Document
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
