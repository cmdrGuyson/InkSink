import * as React from "react";
import { useLayoutEffect, useCallback } from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      autoResize = false,
      minRows = 2,
      maxRows = 16,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const combinedRef = (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Auto-resize textarea based on content
    const autoResizeTextarea = useCallback(() => {
      if (!autoResize) return;

      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";

      // Calculate the new height based on content
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;

      // Calculate how many rows the content would need
      const contentRows = Math.ceil(scrollHeight / lineHeight);

      // Clamp between min and max rows
      const targetRows = Math.max(minRows, Math.min(maxRows, contentRows));

      // Set the height
      textarea.style.height = `${targetRows * lineHeight}px`;
    }, [autoResize, minRows, maxRows]);

    // Auto-resize when value changes
    useLayoutEffect(() => {
      if (autoResize) {
        autoResizeTextarea();
      }
    }, [value, autoResize, autoResizeTextarea]);

    // Custom onChange handler that triggers auto-resize
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e);
      }

      // Trigger auto-resize after a brief delay to ensure the value is updated
      if (autoResize) {
        setTimeout(() => {
          autoResizeTextarea();
        }, 0);
      }
    };

    return (
      <textarea
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex min-h-[60px] w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        ref={combinedRef}
        value={value}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
