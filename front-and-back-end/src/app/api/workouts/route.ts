import { NextResponse, NextRequest } from "next/server";
import { createWorkout, getWorkoutsByUserId, deleteWorkout, updateWorkout } from "@/lib/workouts";
import { WorkoutJSON } from "@/types/workouts";
import { WorkoutSchema } from "@/types/workouts";



//get workouts
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userIdParam = searchParams.get("userId");

        if (!userIdParam) {
            return NextResponse.json({ error: "Missing userId query parameter" }, { status: 400 });
        }

        const userId = Number(userIdParam);

        // Call your DB function
        const workouts = await getWorkoutsByUserId(userId);

        return NextResponse.json(workouts);
    } catch (error: any) {
        console.error("Error in GET /api/workouts:", error);

        // Distinguish between invalid input and DB errors
        if (error.message === "Invalid user_id") {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


//post workouts
export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();  //get request

    //valid data using zod schema
    const result = WorkoutSchema.safeParse(raw);

    //return error if data is invalid
    if (!result.success) {
      return NextResponse.json({ 
        error: "invalid workout data",
      }, 
        { status: 400 }
      );
    }
    
    //call backend function if valid data
    const workout = await createWorkout(result.data);
    return NextResponse.json(workout, { status: 201 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create workout" }, { status: 500 });
  }
}



//put workouts
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Expect workoutId and userId as query params
    const workoutIdParam = searchParams.get("workoutId");
    const userIdParam = searchParams.get("userId");

    if (!workoutIdParam || !userIdParam) {
      return NextResponse.json(
        { error: "Missing workoutId or userId query parameter" },
        { status: 400 }
      );
    }

    const workout_id = Number(workoutIdParam);
    const user_id = Number(userIdParam);

    if (!Number.isInteger(workout_id) || workout_id <= 0) {
      return NextResponse.json({ error: "Invalid workout_id" }, { status: 400 });
    }

    if (!Number.isInteger(user_id) || user_id <= 0) {
      return NextResponse.json({ error: "Invalid user_id" }, { status: 400 });
    }

    // Parse request body
    const raw = await req.json();

    // Validate workout data using Zod schema (omit user_id)
    const workoutData = { ...raw };
    const result = WorkoutSchema.pick({ workout_date: true, workout_kind: true }).safeParse(workoutData);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid workout data" },
        { status: 400 }
      );
    }

    // Call updateWorkout
    const updatedWorkout = await updateWorkout(workout_id, user_id, result.data);

    return NextResponse.json(updatedWorkout, { status: 200 });

  } catch (error: any) {
    console.error("Error in PUT /api/workouts:", error);

    if (
      error.message === "Invalid workout_id" ||
      error.message === "Invalid user_id" ||
      error.message === "Workout not found or you do not have permission to edit it"
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



//delete workouts
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const userIdParam = searchParams.get("userId");
        const workoutIdParam = searchParams.get("workoutId");

        //example link /api/workouts?userId=1&workoutId=42
        // Validate required parameters
        if (!userIdParam || !workoutIdParam) {
            return NextResponse.json({ error: "Missing userId or workoutId query parameter" }, { status: 400 });
        }

        const userId = Number(userIdParam);
        const workoutId = Number(workoutIdParam);

        // Call backend function
        const deleted = await deleteWorkout(userId, workoutId);

        if (!deleted) {
            // Could be workout doesn't exist or doesn't belong to user
            return NextResponse.json({ error: "Workout not found or not owned by user" }, { status: 404 });
        }

        return NextResponse.json({ message: "Workout deleted successfully" }, { status: 200 });

    } catch (error: any) {
        console.error("Error in DELETE /api/workouts:", error);

        // Handle invalid IDs specifically
        if (
            error.message === "Invalid user_id" ||
            error.message === "Invalid workout_id"
        ) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
