"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Button from "../components/Button";

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect unauthenticated users to /login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const goToAddWorkout = () => {
    router.push("/add_workout");
  };

  const goToPreviousWorkouts = () => {
    router.push("/previous_workouts");
  };

  // While checking auth, show a loading message
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  // Authenticated users see the dashboard
  return (
    <div>
      <p>Welcome {session?.user?.username}!</p>
      <Button label="Add workout" onClick={goToAddWorkout} />
      <Button label="See previous workouts" onClick={goToPreviousWorkouts} />
      <Button label="AI advice" />
    </div>
  );
}
