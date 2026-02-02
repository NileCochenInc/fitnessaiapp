"use client";

import { useState } from "react";
import Button from "@/components/Button";

export default function PageClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChat = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Can you help me create a workout plan?",
        context: [
          ["human", "can you tell me about yourself?"],
          [
            "assistant",
            "I am an AI designed to assist with a variety of tasks, including providing information and helping with workouts.",
          ],
        ],
      }),
    });
    const data = await res.json();
    console.log("Chat response:", data);
  };

  const handleProgress = async () => {
    const res = await fetch("/api/progress", {
      method: "GET",
      headers: { "Content-Type": "text/event-stream" },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body");
    }

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const message = line.replace("data: ", "");
          console.log("Progress event:", message);
          if (message === "Finished!") {
            reader.cancel();
            return;
          }
        }
      }
    }
  };

  const handleChatWithProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      await handleChat();
      await handleProgress();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("Error calling AI endpoints:", err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#2f3136" }}
    >
      <div className="bg-[#36393f] w-full max-w-md p-8 rounded-xl shadow-lg flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-center text-[#dcddde]">AI Chat</h1>

        {error && (
          <p className="bg-[#ed4245] text-white p-3 rounded text-center text-sm">
            {error}
          </p>
        )}

        <Button
          label={loading ? "Processing..." : "💬 Start Chat"}
          onClick={handleChatWithProgress}
          disabled={loading}
        />

        <p className="text-xs text-[#72767d] text-center">
          Test the AI chat endpoints with a single click.
        </p>
      </div>
    </div>
  );
}
