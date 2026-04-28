import { NextRequest } from "next/server";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));
import { getServerSession } from "next-auth/next";

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

// Mock global fetch
global.fetch = jest.fn();

import { GET } from "@/app/api/data/user-stats/route";

const mockSession = { user: { id: "123" } };

beforeEach(() => {
  jest.clearAllMocks();
  (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  process.env.DATA_TOOL_URL = "http://data-tool:8080";
});

describe("GET /api/data/user-stats", () => {
  it("returns 401 when no session", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const req = {} as NextRequest;
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("forwards request to data-tool with correct userId", async () => {
    const mockData = { total_workouts: 5 };
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    const req = {} as NextRequest;
    const res = await GET(req);

    expect(fetch).toHaveBeenCalledWith(
      "http://data-tool:8080/api/user-stats/123",
      expect.objectContaining({ signal: expect.anything() })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(mockData);
  });

  it("returns error when data-tool is unreachable", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Connection failed"));

    const req = {} as NextRequest;
    const res = await GET(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Connection failed");
  });
});
