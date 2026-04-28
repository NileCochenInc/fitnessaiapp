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

    // Get AI service URL from environment variable (falls back to Azure Container Apps internal service name)
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://fitness-ai-app-ai.internal.ashycliff-d78872a9.canadacentral.azurecontainerapps.io";
    const chatUrl = `${aiServiceUrl}/chat`;

    console.log(`[chat] Calling AI service: POST ${chatUrl}`);
    console.log(`[chat] User ID: ${userId}`);
    console.log(`[chat] Request body:`, JSON.stringify(body).substring(0, 200));

    // Forward request to Python backend with 30s timeout
    const pythonRes = await fetch(chatUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "user-id": userId, // forward user id for per-user events
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90000), // 90s — covers AI service cold start from zero
    });

    console.log(`[chat] AI service response status: ${pythonRes.status}`);

    // Check for errors from AI service
    if (!pythonRes.ok) {
      const errorText = await pythonRes.text();
      console.error(`[chat] AI service error response:`, errorText);
      throw new Error(`AI service returned ${pythonRes.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await pythonRes.json();
    console.log(`[chat] Successfully parsed AI response`);
    return NextResponse.json(data, { status: pythonRes.status });
  } catch (err: any) {
    console.error("Error in POST /api/chat:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
