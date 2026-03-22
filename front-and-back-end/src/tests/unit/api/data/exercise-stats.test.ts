import { NextRequest } from "next/server";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));
import { getServerSession } from "next-auth/next";

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

global.fetch = jest.fn();

import { GET } from "@/app/api/data/exercise-stats/[exerciseId]/route";

const mockSession = { user: { id: "123" } };

beforeEach(() => {
  jest.clearAllMocks();
  (getServerSession as jest.Mock).mockResolvedValue(mockSession);
});

describe("GET /api/data/exercise-stats/[exerciseId]", () => {
  it("returns 401 when no session", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const req = {} as NextRequest;
    const res = await GET(req, { params: { exerciseId: "5" } });

    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid exerciseId", async () => {
    const req = {} as NextRequest;

    const res = await GET(req, { params: { exerciseId: "invalid" } });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid exerciseId");
  });

  it("returns 400 for negative exerciseId", async () => {
    const req = {} as NextRequest;
    const res = await GET(req, { params: { exerciseId: "-5" } });
    expect(res.status).toBe(400);
  });

  it("forwards request to data-tool with correct userId and exerciseId", async () => {
    const mockData = { frequency: 10, max_metrics: { weight: 185 } };
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    const req = {} as NextRequest;
    const res = await GET(req, { params: { exerciseId: "5" } });

    expect(fetch).toHaveBeenCalledWith(
      "http://data-tool:8080/api/exercise-stats/123/5"
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(mockData);
  });

  it("returns error when data-tool is unreachable", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Timeout"));

    const req = {} as NextRequest;
    const res = await GET(req, { params: { exerciseId: "5" } });

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Timeout");
  });
});
