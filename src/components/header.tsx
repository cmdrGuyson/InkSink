"use client";

import { Settings, LogOut, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/providers/auth.provider";
import { toast } from "sonner";

export const Header = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const handlePreferences = () => {
    toast.warning("This feature is not yet available");
  };

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="p-2 hover:bg-accent rounded-md transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handlePreferences} className="text-xs">
              <SettingsIcon className="h-3 w-3 mr-2" />
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              variant="destructive"
              className="text-xs"
            >
              <LogOut className="h-3 w-3 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
