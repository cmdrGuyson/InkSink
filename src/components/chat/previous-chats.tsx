import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMetadata } from "@/hooks/use-chat";
import { formatDateTime } from "@/lib/utils";

interface PreviousChatsProps {
  recentChats: ChatMetadata[];
  handleSelectChat: (chatId: string) => void;
  handleDeleteChat: (chatId: string, e: React.MouseEvent) => void;
}

const PreviousChats = ({
  recentChats,
  handleSelectChat,
  handleDeleteChat,
}: PreviousChatsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Recent Chats"
        >
          <Clock className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Recent Chats
        </div>
        <DropdownMenuSeparator />
        {recentChats.length === 0 ? (
          <div className="px-2 py-2 text-sm text-muted-foreground">
            No recent chats
          </div>
        ) : (
          recentChats.map((chat) => (
            <DropdownMenuItem
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className="flex items-center justify-between w-full cursor-pointer group"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {chat.title || "Untitled Chat"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDateTime(chat.updated_at)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => handleDeleteChat(chat.id, e)}
                title="Delete chat"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PreviousChats;
