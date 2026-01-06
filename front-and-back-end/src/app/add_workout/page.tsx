"use client"; // must be client component for interactivity


import { useRouter } from "next/navigation";
import Button from '../../components/Button';



export default function Page() {
    const router = useRouter();

    const goToAddExercise = () => {
        router.push("/add_exercise"); // navigate to /add_exercise
    };

    const pushWorkout = () => {
        //push new workout to database
        
        //push workout date and workout type
    }


    return (
        <div>
        <h1>Add workout</h1>
        <form>
            <label>
                Date:
                <input type="text"></input>
            </label>
            <label>
                Workout type:
                <input type="text"></input>
            </label>
        </form>
        <Button label="save" onClick={goToAddExercise}/>
        </div>
        );

}