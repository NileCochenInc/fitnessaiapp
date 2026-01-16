"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, goal }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Signup failed");
        setLoading(false);
        return;
      }

      const loginResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      setLoading(false);

      if (loginResult?.error) {
        setError("Signup succeeded, but login failed.");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#2f3136" }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-[#36393f] p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-3xl font-bold mb-4 text-center text-[#dcddde]">
          Sign Up
        </h1>

        {error && (
          <div className="bg-[#ed4245] text-white p-2 mb-4 rounded text-center">
            {error}
          </div>
        )}

        <label className="block mb-1 font-semibold text-[#dcddde]">Username</label>
        <input
          type="text"
          className="w-full p-3 mb-4 rounded bg-[#2f3136] text-[#dcddde] border border-[#72767d] placeholder-[#72767d] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

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
          className="w-full p-3 mb-4 rounded bg-[#2f3136] text-[#dcddde] border border-[#72767d] placeholder-[#72767d] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="block mb-1 font-semibold text-[#dcddde]">Goal</label>
        <input
          type="text"
          className="w-full p-3 mb-6 rounded bg-[#2f3136] text-[#dcddde] border border-[#72767d] placeholder-[#72767d] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
          placeholder="Enter your fitness goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white p-3 rounded transition-colors duration-200 disabled:bg-gray-500"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <p className="text-center mt-4 text-sm text-[#b9bbbe]">
          Already have an account?{" "}
          <a href="/login" className="text-[#5865f2] hover:underline">
            Log In
          </a>
        </p>
      </form>
    </div>
  );
}
