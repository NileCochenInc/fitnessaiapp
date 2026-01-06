"use client"; // must be client component for interactivity


import Button from '../components/Button';
import { useRouter } from "next/navigation";



export default function Page() {
  const router = useRouter();

  const goToAddWorkout = () => {
    router.push("/add_workout"); // navigate to /about
  };

  return (
    <div>
      <p>Welcome</p>
      <Button label="Add workout" onClick={goToAddWorkout}/>
      <Button label="See previous workouts"/>
      <Button label="AI advice"/>
    </div>
  );
}