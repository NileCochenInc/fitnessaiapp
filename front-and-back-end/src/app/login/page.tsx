"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#2f3136" }}>
      <form
        onSubmit={handleSubmit}
        className="bg-[#36393f] p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-3xl font-bold mb-4 text-center text-[#dcddde]">Login</h1>

        {error && (
          <div className="bg-[#ed4245] text-white p-2 mb-4 rounded text-center">
            {error}
          </div>
        )}

        <label className="block mb-1 font-semibold text-[#dcddde]">Email</label>
        <input
          type="email"
          className="w-full p-3 mb-4 rounded bg-[#2f3136] text-[#dcddde] border border-[#72767d] placeholder-[#72767d] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block mb-1 font-semibold text-[#dcddde]">Password</label>
        <input
          type="password"
          className="w-full p-3 mb-6 rounded bg-[#2f3136] text-[#dcddde] border border-[#72767d] placeholder-[#72767d] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white p-3 rounded transition-colors duration-200 disabled:bg-gray-500"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#72767d]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#36393f] text-[#72767d]">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full bg-white hover:bg-gray-100 text-black p-3 rounded transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>

        <p className="text-center mt-4 text-sm text-[#b9bbbe]">
          Don’t have an account?{" "}
          <a href="/signup" className="text-[#5865f2] hover:underline">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
}
