"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import SystemMessages from "@/components/SystemMessages";
import ReactMarkdown from "react-markdown";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type SystemMessage = {
  id: string;
  text: string;
  completed: boolean;
};

export default function PageClient() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [systemMessages, setSystemMessages] = useState<SystemMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages or system messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, systemMessages]);

  const buildContext = () => {
    return messages.map((msg) => [
      msg.role === "user" ? "human" : "assistant",
      msg.content,
    ]);
  };

  const addSystemMessage = (text: string) => {
    setSystemMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${Math.random()}`,
        text,
        completed: false,
      },
    ]);
  };

  const completeLastSystemMessage = () => {
    setSystemMessages((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[updated.length - 1].completed = true;
      return updated;
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const prompt = inputValue; // Capture BEFORE clearing
    const context = buildContext();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);
    setError(null);
    setSystemMessages([]);

    try {
      // Call chat endpoint FIRST to trigger the task
      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "user-id": "2"
        },
        body: JSON.stringify({
          prompt: prompt,
          context: context,
        }),
      });

      if (!chatRes.ok) {
        throw new Error(`Chat failed: HTTP ${chatRes.status}`);
      }

      const chatData = await chatRes.json();
      console.log("=== Chat API Response ===");
      console.log("Full response:", chatData);
      console.log("Response type:", typeof chatData);
      console.log("Response keys:", Object.keys(chatData));

      // NOW start progress stream (after chat has been initiated)
      const progressRes = await fetch("/api/progress", {
        method: "GET",
        headers: { 
          "Content-Type": "text/event-stream",
          "user-id": "2"
        },
      });

      if (!progressRes.ok) {
        throw new Error(`Progress failed: HTTP ${progressRes.status}`);
      }

      const reader = progressRes.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      console.log("=== Progress Stream Started ===");
      let aiMessage = "";
      let currentMessageType: "system" | "ai" | null = null;
      const messageMap: { [key: string]: string } = {
        "Creating embeddings": "Creating embeddings",
        "Retrieving relevant data": "Retrieving relevant data",
        "Answering your question...": "Answering your question...",
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log("=== Progress Stream Ended ===");
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log("Raw chunk received:", chunk);
        
        // Find where the data labels are
        let remaining = chunk;
        
        while (remaining.length > 0) {
          const systemIdx = remaining.indexOf("data: System_message: ");
          const aiIdx = remaining.indexOf("data: AI_message: ");
          const finishedIdx = remaining.indexOf("data: Finished!");

          let nextIdx = -1;
          let nextType: "system" | "ai" | "finished" | null = null;

          // Find which comes first
          if (systemIdx !== -1) {
            nextIdx = systemIdx;
            nextType = "system";
          }
          if (aiIdx !== -1 && (nextIdx === -1 || aiIdx < nextIdx)) {
            nextIdx = aiIdx;
            nextType = "ai";
          }
          if (finishedIdx !== -1 && (nextIdx === -1 || finishedIdx < nextIdx)) {
            nextIdx = finishedIdx;
            nextType = "finished";
          }

          if (nextIdx === -1) {
            // No more data markers, append rest to current message
            if (currentMessageType === "ai") {
              aiMessage += remaining;
              console.log("AI message accumulated, current length:", aiMessage.length);
            }
            break;
          }

          if (nextType === "system") {
            // Mark previous message as complete when switching to new system message
            if (currentMessageType === "system" || currentMessageType === null) {
              completeLastSystemMessage();
            }
            
            currentMessageType = "system";
            const prefixLength = "data: System_message: ".length;
            const contentStart = nextIdx + prefixLength;
            const nextMarker = remaining.indexOf("data: ", contentStart);
            const systemMessage = remaining.substring(contentStart, nextMarker === -1 ? remaining.length : nextMarker).trim();
            console.log("System message:", systemMessage);
            
            // Strip "System_message: " prefix if present
            const displayText = systemMessage.replace(/^System_message:\s*/, "");
            addSystemMessage(displayText);
            
            remaining = remaining.substring(nextMarker === -1 ? remaining.length : nextMarker);
          } else if (nextType === "ai") {
            // Mark the last system message as complete when AI starts
            completeLastSystemMessage();
            
            currentMessageType = "ai";
            const prefixLength = "data: AI_message: ".length;
            const contentStart = nextIdx + prefixLength;
            const nextMarker = remaining.indexOf("data: ", contentStart);
            aiMessage = remaining.substring(contentStart, nextMarker === -1 ? remaining.length : nextMarker);
            console.log("AI message start (first part):", aiMessage);
            setSystemMessages([]); // Clear system messages when AI response starts
            remaining = remaining.substring(nextMarker === -1 ? remaining.length : nextMarker);
          } else if (nextType === "finished") {
            console.log("Received Finished signal");
            // Save any remaining message
            if (currentMessageType === "ai" && aiMessage) {
              const assistantMessage: Message = {
                id: Date.now().toString() + "_ai",
                role: "assistant",
                content: aiMessage.trim(),
              };
              console.log("=== Complete AI Message (Final) ===");
              console.log(aiMessage);
              console.log("Adding final assistant message:", assistantMessage);
              setMessages((prev) => [...prev, assistantMessage]);
              aiMessage = "";
            }
            reader.cancel();
            break;
          }
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("=== Error occurred ===");
      console.error("Error:", err);
      console.error("Error message:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col p-4"
      style={{ backgroundColor: "#2f3136" }}
    >
      <div className="w-full max-w-2xl mx-auto flex flex-col h-screen gap-4">
        {/* Header */}
        <div className="pt-4 flex justify-center items-center relative">
          <div className="absolute left-0">
            <Button
              label="🏠"
              onClick={() => router.push("/")}
            />
          </div>
          <h1 className="text-3xl font-bold text-[#dcddde]">
            Fit Buddy AI Chat
          </h1>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-[#ed4245] text-white p-3 rounded text-sm text-center">
            {error}
          </div>
        )}

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto bg-[#36393f] rounded-lg p-4 flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#72767d] text-center">
                Start a conversation with the AI
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-[#5865f2] text-white"
                      : "bg-[#2f3136] text-[#dcddde]"
                  }`}
                >
                  <div className="break-words text-sm prose prose-invert max-w-none prose-sm">
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
                        li: ({ node, ...props }) => <li className="ml-2" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                        em: ({ node, ...props }) => <em className="italic" {...props} />,
                        h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="font-bold mb-1" {...props} />,
                        code: ({ node, ...props }) => <code className="bg-[#1e1f22] px-1 rounded text-[#fff] text-xs" {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* System messages display */}
          {systemMessages.length > 0 && (
            <SystemMessages messages={systemMessages} />
          )}

          {/* Loading indicator */}
          {loading && systemMessages.length === 0 && messages.filter(m => m.role === "assistant").length === 0 && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-lg bg-[#2f3136]">
                <p className="text-xs text-[#b9bbbe]">AI is thinking...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 p-3 rounded-lg bg-[#2f3136] text-[#dcddde] border border-[#72767d] placeholder-[#72767d] focus:outline-none focus:ring-2 focus:ring-[#5865f2] disabled:opacity-50"
          />
          <Button
            label={loading ? "..." : "💬"}
            onClick={handleSendMessage}
            disabled={loading || !inputValue.trim()}
          />
        </div>
      </div>
    </div>
  );
}
