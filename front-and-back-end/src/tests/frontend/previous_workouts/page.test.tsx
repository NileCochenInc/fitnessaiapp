// __tests__/previous_workouts.test.tsx
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { act } from "@testing-library/react";
import Page from "@/app/previous_workouts/page"; // Using @ alias
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
    // Reset mocks
    (fetch as jest.Mock).mockReset();
    pushMock.mockReset();

    // Suppress "not wrapped in act" warnings
    jest.spyOn(console, "error").mockImplementation((msg, ...args) => {
      if (typeof msg === "string" && msg.includes("not wrapped in act")) return;
      // still log other errors normally
      console.error(msg, ...args);
    });
  });

  it("shows loading state initially", async () => {

    render(<Page />);

    expect(screen.getByText(/loading workouts/i)).toBeInTheDocument();
  });

  it("shows error message if fetch fails", async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error("Failed to fetch"));

    
    await act(async () => {
      render(<Page />);
    });


    await waitFor(() => {
      expect(screen.getByText(/error: failed to fetch/i)).toBeInTheDocument();
    });

    // The Add New Workout button is always visible
    expect(screen.getByText(/add new workout/i)).toBeInTheDocument();
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

    await act(async () => {
      render(<Page />);
    })

    await waitFor(() => {
      expect(screen.getByText(/previous workouts/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/2026-01-12/i)).toBeInTheDocument();
    expect(screen.getByText(/strength/i)).toBeInTheDocument();
    expect(screen.getByText(/2026-01-11/i)).toBeInTheDocument();
    expect(screen.getByText(/cardio/i)).toBeInTheDocument();

    expect(screen.getByText(/add new workout/i)).toBeInTheDocument();
  });

  it("navigates to /add_workout when the button is clicked", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await act(async () => {
      render(<Page />);
    });
    const button = screen.getByText(/add new workout/i);
    fireEvent.click(button);

    expect(pushMock).toHaveBeenCalledWith("/add_workout");
  });

  it("shows 'No previous workouts found' if API returns empty array", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await act(async () => {
      render(<Page />);
    });

    await waitFor(() => {
      expect(screen.getByText(/no previous workouts found/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/add new workout/i)).toBeInTheDocument();
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

});
