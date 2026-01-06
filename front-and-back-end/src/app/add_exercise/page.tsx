"use client"; // must be client component for interactivity


import { useRouter } from "next/navigation";
import Button from '../../components/Button';



export default function Page() {
    const router = useRouter();

    const goToAddExerciseData = () => {
        router.push("/add_exercise_data"); // navigate to /add_exercise_data
    };


    const pushExercise = () => {
        //push workout_excercise to backend
        //push excercise name
    }



    return (
        <div>
            <h1>previous exercises:</h1>
            <h1>Add exercise</h1>
            <form>
                <label>
                    exercise name:
                    <input type="text"></input>
                </label>
            </form>
            <Button label="save" onClick={goToAddExerciseData} />
        </div>
        );

}