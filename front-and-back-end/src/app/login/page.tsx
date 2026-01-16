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
