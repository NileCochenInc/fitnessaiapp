"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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

  const handleLogout = () => signOut({ callbackUrl: "/login" });

  if (status === "loading")
    return (
      <div className="flex items-center justify-center h-screen bg-[#2f3136]">
        <p className="text-lg text-[#dcddde]">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#2f3136]">
      <div className="bg-[#36393f] rounded-xl shadow-lg p-6 w-full max-w-md flex flex-col gap-6">
        {/* Welcome text */}
        <p className="text-2xl font-semibold text-center text-[#dcddde]">
          Welcome, {session?.user?.username}!
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-4">
          <Button
            label="Add Workout"
            onClick={goToAddWorkout}
            className="w-full sm:w-auto text-white hover:bg-[#4752c4]"
            style={{ backgroundColor: "#5865f2" }}
          />
          <Button
            label="See Previous Workouts"
            onClick={goToPreviousWorkouts}
            className="w-full sm:w-auto text-white hover:bg-[#4752c4]"
            style={{ backgroundColor: "#5865f2" }}
          />
          <Button
            label="AI Advice"
            className="w-full sm:w-auto text-white hover:bg-[#4752c4]"
            style={{ backgroundColor: "#5865f2" }}
          />
        </div>

        {/* Logout button */}
        <Button
          label="Log Out"
          onClick={handleLogout}
          className="mt-4 w-full sm:w-auto text-white hover:bg-[#b3393c]"
          style={{ backgroundColor: "#ed4245" }}
        />
      </div>
    </div>
  );
}
