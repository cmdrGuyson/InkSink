"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Profile, ProfileService } from "@/services/profile.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  profile: Profile | null;
  isProfileLoading: boolean;
  spendCredit: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { push } = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async (id: string) => {
      try {
        const _profile = await ProfileService.getUserProfile(id);
        if (_profile) {
          setProfile(_profile);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    if (!user?.id) return;

    fetchUserProfile(user.id);
  }, [user?.id]);

  // Spend a credit from profile credit count
  const spendCredit = () => {
    if (!profile) {
      return;
    }
    const _profile: Profile = {
      ...profile,
      credit_count: profile.credit_count - 1,
    };
    setProfile(_profile);
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
    push("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signOut, profile, isProfileLoading, spendCredit }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
