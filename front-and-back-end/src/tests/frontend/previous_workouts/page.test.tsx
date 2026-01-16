// __tests__/previous_workouts.test.tsx
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Page from "@/app/previous_workouts/page";
import * as nextRouter from "next/navigation";

// ------------------------
// Mock global fetch
// ------------------------
global.fetch = jest.fn();

// ------------------------
// Mock Next.js router
// ------------------------
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// ------------------------
// Tests
// ------------------------
describe("Previous Workouts Page", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
    pushMock.mockReset();

    // Suppress "not wrapped in act" warnings
    jest.spyOn(console, "error").mockImplementation((msg, ...args) => {
      if (typeof msg === "string" && msg.includes("not wrapped in act")) return;
      console.error(msg, ...args);
    });
  });

  it("shows loading state initially", () => {
    render(<Page />);
    expect(screen.getByText(/loading workouts/i)).toBeInTheDocument();
  });

  it("shows error message if fetch fails", async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error("Failed to fetch"));

    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
    });

    // Button is not rendered in error state, so we skip checking it
  });

  it("renders previous workouts correctly", async () => {
    const mockWorkouts = [
      { id: 1, workout_date: "2026-01-12", workout_kind: "Strength" },
      { id: 2, workout_date: "2026-01-11", workout_kind: "Cardio" },
    ];

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockWorkouts,
    });

    render(<Page />);

    // Wait for workout cards to appear
    await waitFor(() => {
      expect(screen.getByText(/previous workouts/i)).toBeInTheDocument();
      expect(screen.getByText(/2026-01-12/i)).toBeInTheDocument();
      expect(screen.getByText(/strength/i)).toBeInTheDocument();
      expect(screen.getByText(/2026-01-11/i)).toBeInTheDocument();
      expect(screen.getByText(/cardio/i)).toBeInTheDocument();
    });

    // Wait for the button (after loading finishes)
    const addButton = await screen.findByText(/add new workout/i);
    expect(addButton).toBeInTheDocument();
  });

  it("navigates to /add_workout when the button is clicked", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<Page />);

    // Wait for the button to appear after loading
    const button = await screen.findByText(/add new workout/i);
    fireEvent.click(button);

    expect(pushMock).toHaveBeenCalledWith("/add_workout");
  });

  it("shows 'No previous workouts found' if API returns empty array", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText(/no previous workouts found/i)).toBeInTheDocument();
    });

    const addButton = await screen.findByText(/add new workout/i);
    expect(addButton).toBeInTheDocument();
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });
});
