import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 


// =============================
// Request shape for /api/chat
// Method: POST
// Headers:
//   user-id: <string>   -> unique identifier for the authenticated user
// Body (JSON):
//   {
//       "prompt": "<string>",       // required: the message or prompt to send to the AI
//       "context": ["<string>"]     // optional: conversation history or context
//   }
// Response: JSON object returned from the Python backend
// Example curl:
//   curl -X POST http://localhost:3000/api/chat \
//        -H "Content-Type: application/json" \
//        -H "user-id: 12345" \
//        -d '{"prompt": "Hello AI!", "context": ["Previous message"]}'
// =============================

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json(); // contains { prompt: "...", context: [...] }

    // Forward request to Python backend
    const pythonRes = await fetch("http://ai:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "user-id": userId, // forward user id for per-user events
      },
      body: JSON.stringify(body),
    });

    const data = await pythonRes.json();
    return NextResponse.json(data, { status: pythonRes.status });
  } catch (err: any) {
    console.error("Error in POST /api/chat:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
