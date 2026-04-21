// Minimal health check - no dependencies
export async function GET() {
  return new Response("OK", { status: 200 });
}
