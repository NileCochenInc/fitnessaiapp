"use client";

import { PulseLoader } from "react-spinners";

type SystemMessage = {
  id: string;
  text: string;
  completed: boolean;
};

interface SystemMessagesProps {
  messages: SystemMessage[];
}

export default function SystemMessages({ messages }: SystemMessagesProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-[#2f3136] border border-[#72767d]">
        <div className="space-y-2">
          {messages.map((msg, index) => (
            <div key={msg.id} className="flex items-center gap-2 text-xs text-[#72767d]">
              <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                {msg.completed ? (
                  <span className="text-[#43b581]">✅</span>
                ) : index === messages.length - 1 ? (
                  <PulseLoader color="#5865f2" size={4} />
                ) : null}
              </span>
              <span className="break-words">{msg.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
