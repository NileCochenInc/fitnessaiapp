import { NextResponse } from "next/server";
import { createWorkout } from "@/lib/workouts";
import { WorkoutJSON } from "@/types/workouts";
import { WorkoutSchema } from "@/types/workouts";



//get workouts

//post workouts
export async function POST(req: Request) {
  try {


    const raw = await req.json();  //get request
    
    //validate data
    if (
      typeof raw === "object" &&
      raw !== null &&
      typeof raw.user_id === "number" &&
      raw.user_id.trim() !== "" &&
      typeof raw.date === "string" &&
      raw.date.trim() !== "" &&
      typeof raw.workout_kind === "string" &&
      raw.workout_kind.trim() !== ""
    ) {
      //call backend function if valid data
      const body = raw as WorkoutJSON;
      const workout = await createWorkout(body);
      return NextResponse.json(workout, { status: 201 });

    } else {

      //return invalid data if data is invalid
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    }
    
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create workout" }, { status: 500 });
  }
}



//put workouts

//delete workouts