import { NextResponse } from "next/server";
import { createWorkout, WorkoutJSON } from "@/lib/workouts";


//get workouts

//post workouts
export async function POST(req: Request) {
  try {


    const raw = await req.json();  //get request
    
    //validate data
    if (
      typeof raw === 'object' &&
      raw !== null &&
      'user_id' in raw &&
      'date' in raw &&
      'workout_kind' in raw
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