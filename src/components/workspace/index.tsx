"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LeftPanel } from "./left-panel";
import { RightPanel } from "./right-panel";

interface WorkspaceProps {
  documentId?: string;
}

export const Workspace = ({ documentId }: WorkspaceProps) => {
  const [leftWidth, setLeftWidth] = useState(70);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      if (newLeftWidth >= 25 && newLeftWidth <= 75) {
        setLeftWidth(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex h-full relative bg-background rounded-lg border shadow-lg overflow-hidden",
        isDragging && "cursor-col-resize select-none"
      )}
    >
      {/* Left Panel */}
      <div className="h-full overflow-auto" style={{ width: `${leftWidth}%` }}>
        <LeftPanel documentId={documentId} />
      </div>

      {/* Resizable Divider */}
      <div
        className="w-1 bg-border hover:bg-accent cursor-col-resize relative group"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-2 hover:w-3 transition-all duration-200" />
      </div>

      {/* Right Panel */}
      <div
        className="h-full overflow-auto"
        style={{ width: `${100 - leftWidth}%` }}
      >
        <RightPanel />
      </div>
    </div>
  );
};
