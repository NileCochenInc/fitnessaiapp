import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// =============================
// Request shape for /api/progress
// Method: GET
// Headers:
//   None (auth handled via NextAuth cookie)
// Body: None
// Response: SSE (Server-Sent Events) stream with progress messages for the user
// Each event looks like:
//   data: Progress: 20%
//   data: Progress: 40%
//   ...
//   data: Finished!
// Example curl (requires NextAuth cookie):
//   curl http://localhost:3000/api/progress --cookie "next-auth.session-token=<token>"
// =============================

export const dynamic = "force-dynamic"; // ensure no caching
export const runtime = "nodejs"; // required for fetch streaming

export async function GET(req: Request) {
  try {
    // 1️⃣ Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const userId = session.user.id;

    // 2️⃣ Call Python SSE endpoint
    const pythonRes = await fetch("http://ai:5000/progress", {
      headers: { "user-id": String(userId) },
    });

    if (!pythonRes.body) {
      throw new Error("Python SSE endpoint did not return a body");
    }

    // 3️⃣ Pipe Python SSE as Next.js response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = pythonRes.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    console.error("Error in GET /api/progress:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
