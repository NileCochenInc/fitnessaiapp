"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react"; // <-- import signOut
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

  const goToAddWorkout = () => router.push("/add_workout");
  const goToPreviousWorkouts = () => router.push("/previous_workouts");

  // Logout function
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" }); // redirects to login after logout
  };

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="p-4 flex flex-col gap-2">
      <p>Welcome {session?.user?.username}!</p>

      <Button label="Add workout" onClick={goToAddWorkout} />
      <Button label="See previous workouts" onClick={goToPreviousWorkouts} />
      <Button label="AI advice" />

      {/* Logout button */}
      <Button label="Log out" onClick={handleLogout} className="mt-4" />
    </div>
  );
}
