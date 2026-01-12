import { authApi } from "@/lib/api";
import { AuthHandlerParams, AuthResponse } from "@/types";


export async function handleAuth(
  e: React.FormEvent,
  {
    mode,
    email,
    password,
    name,
    confirmPassword,
    setError,
    setLoading,
  }: AuthHandlerParams,
  onSuccess: (token: string, user: any, redirect: string) => void
) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    // Validation
    if (mode === "signup") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }
      if (!name.trim()) {
        setError("Name is required");
        setLoading(false);
        return;
      }
    }

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    // Call server API
    let response;
    if (mode === "login") {
      response = await authApi.login({ email, password });
    } else {
      response = await authApi.signup({
        name,
        email,
        password,
        isSignup: true,
      });
    }

    if (!response.success) {
      setError(`Authentication failed: ${response.message || 'Unknown error'}`);
      setLoading(false);
      return;
    }

    if (response.data) {
      const { token, user } = response.data;
      document.cookie = `auth-token=${token};path=/;max-age=86400;SameSite=Strict`;
      localStorage.setItem("user", JSON.stringify(user));

      // Call success callback with redirect parameter
      onSuccess(token, user, "/dashboard");
    }
  } catch (err) {
    console.error("Authentication error:", err);
    setError("Authentication failed. Please try again.");
    setLoading(false);
  }
}
