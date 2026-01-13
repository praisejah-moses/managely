"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page after a brief delay
    const timer = setTimeout(() => {
      router.push("/login");
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="text-center space-y-6 animate-in fade-in duration-1000">
        {/* Logo or App Name */}
        <div className="space-y-2">
          <h1 className="text-5xl font-black bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Managely
          </h1>
          <p className="text-sm text-slate-600 font-medium">Manage your projects efficiently</p>
        </div>

        {/* Animated Loading Spinner */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );
}
 