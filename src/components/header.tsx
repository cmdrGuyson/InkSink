import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, User } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export const Header = () => {
  return (
    <header className="flex items-center justify-between py-3 bg-background border-b px-24">
      <div className="flex items-center">
        <Link
          href="/"
          className="text-xl font-semibold font-mono cursor-pointer"
        >
          InkSink
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <Button
          variant="ghost"
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
