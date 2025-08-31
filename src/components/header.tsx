"use client";

import { Settings, LogOut, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import CreditsIndicator from "@/components/credits";

import { useAuth } from "@/providers/auth.provider";

export const Header = () => {
  const { signOut, profile } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
  };

  const handlePreferences = () => {
    router.push("/desk/preferences");
  };

  return (
    <header className="flex items-center justify-between py-3 bg-background border-b px-24">
      <div className="flex items-center">
        <Link
          href="/desk/write"
          className="flex items-center gap-2 text-xl font-semibold font-mono cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logo.svg"
            alt="InkSink Logo"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          InkSink
        </Link>
      </div>
      <div className="flex gap-4">
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
        {profile ? (
          <CreditsIndicator
            used={50 - profile?.credit_count}
            limit={50}
            tier={profile?.tier as "free" | "premium"}
          />
        ) : null}
      </div>
    </header>
  );
};
