import * as React from "react";
import type { ShouldShowProps } from "../../types";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { ToolbarButton } from "../toolbar-button";
import { Wand2 } from "lucide-react";

interface SelectionBubbleMenuProps {
  editor: Editor;
}

export const SelectionBubbleMenu: React.FC<SelectionBubbleMenuProps> = ({
  editor,
}) => {
  const [selectedText, setSelectedText] = React.useState("");

  const updateSelectedText = React.useCallback(() => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, " ");
    setSelectedText(text);
  }, [editor]);

  const shouldShow = React.useCallback(
    ({ editor, from, to }: ShouldShowProps) => {
      if (from === to) return false;
      if (!editor.isEditable) return false;

      // Avoid overlapping with the link bubble when a link mark is active
      if (editor.isActive("link")) return false;

      const text = editor.state.doc.textBetween(from, to, " ").trim();
      if (!text) return false;

      updateSelectedText();
      return true;
    },
    [updateSelectedText]
  );

  const handleRefineInChat = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const text = selectedText.trim();
      if (!text) return;

      try {
        const event = new CustomEvent("refine-in-chat", { detail: { text } });
        window.dispatchEvent(event);
      } catch {
        // no-op
      }
    },
    [selectedText]
  );

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      options={{
        placement: "top",
      }}
    >
      <div className="bg-background flex items-center overflow-hidden rounded-md shadow-sm">
        <ToolbarButton
          tooltip="Refine selected content in chat"
          onClick={handleRefineInChat}
          size="sm"
          className="p-2 !min-w-0 h-8 rounded-md shadow-sm cursor-pointer"
        >
          <Wand2 className="h-4 w-4 mr-1" />
          Refine
        </ToolbarButton>
      </div>
    </BubbleMenu>
  );
};
