"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuthState } from "./useAuthState";
import { handleAuth } from "./authHandlers";

export default function AuthPage() {
  const {
    mode,
    setMode,
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    confirmPassword,
    setConfirmPassword,
    error,
    setError,
    loading,
    setLoading,
  } = useAuthState();

  const router = useRouter();
  const searchParams = useSearchParams();

  const onSubmit = (e: React.FormEvent) => {
    const redirect = searchParams.get("redirect") || "/dashboard";

    handleAuth(
      e,
      { mode, email, password, name, confirmPassword, setError, setLoading },
      () => router.push(redirect)
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-black to-gray-800 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-center text-white text-3xl font-semibold">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "signup" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Input
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/10 text-white placeholder:text-gray-300 border-white/20"
                  />
                </motion.div>
              )}

              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 text-white placeholder:text-gray-300 border-white/20"
              />

              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 text-white placeholder:text-gray-300 border-white/20"
              />

              {mode === "signup" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/10 text-white placeholder:text-gray-300 border-white/20"
                  />
                </motion.div>
              )}

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-6 text-lg font-medium bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading
                  ? "Loading..."
                  : mode === "login"
                  ? "Login"
                  : "Sign Up"}
              </Button>
            </form>

            <p className="text-center text-gray-300 text-sm mt-2">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-blue-400 hover:underline"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-blue-400 hover:underline"
                  >
                    Login
                  </button>
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
