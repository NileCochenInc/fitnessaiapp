import { NextResponse } from "next/server";
import { createWorkout } from "@/lib/workouts";
import { WorkoutJSON } from "@/types/workouts";
import { WorkoutSchema } from "@/types/workouts";



//get workouts

//post workouts
export async function POST(req: Request) {
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

//delete workouts