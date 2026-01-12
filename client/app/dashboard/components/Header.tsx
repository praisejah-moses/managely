"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useState, useEffect } from "react";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function Header({ searchQuery, setSearchQuery }: HeaderProps) {
  const router = useRouter();
  const [userInitials, setUserInitials] = useState("PM");

  useEffect(() => {
    const user = getUser();
    if (user && user.name) {
      // Get first two characters of name for initials
      const initials = user.name
        .split(" ")
        .map((word: string) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      setUserInitials(initials);
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Call server logout endpoint
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear client-side authentication regardless of server response
      document.cookie = "auth-token=; path=/; max-age=0";
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-lg">
      <div className="absolute inset-0 bg-white/40" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex h-16 items-center justify-between">
          {/* left area (logo) - centered */}
          <div className="flex items-center gap-3 flex-1">
            <Image
              src="/logo.svg"
              alt="Managely Logo"
              width={40}
              height={40}
              className="object-contain transition-transform duration-200 hover:scale-110"
            />
          </div>

          {/* centered search */}
          <div className="hidden sm:block">
            <Input
              placeholder="🔍 Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 border-2 border-slate-200 rounded-lg bg-white/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
            />
          </div>

          {/* right area (avatar and logout) */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-slate-700 hover:text-red-600 hover:border-red-300 transition-colors"
            >
              Logout
            </Button>
            {/* lightweight user avatar (no link) */}
            <Avatar className="h-10 w-10 border-2 border-purple-300 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110">
              <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Subtle bottom border */}
      <div className="h-px bg-slate-200" />
    </header>
  );
}
