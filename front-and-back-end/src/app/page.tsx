"use client"; // must be client component for interactivity


import Button from '../components/Button';
import { useRouter } from "next/navigation";



export default function Page() {
  const router = useRouter();

  const goToAddWorkout = () => {
    router.push("/add_workout"); // navigate to /about
  };

  const goToPreviousWorkouts = () => {
    router.push("/previous_workouts"); // navigate to /previous_workouts
  }

  return (
    <div>
      <p>Welcome</p>
      <Button label="Add workout" onClick={goToAddWorkout}/>
      <Button label="See previous workouts" onClick={goToPreviousWorkouts}/>
      <Button label="AI advice"/>
    </div>
  );
}