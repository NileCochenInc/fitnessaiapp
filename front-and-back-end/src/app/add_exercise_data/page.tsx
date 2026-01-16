import { Suspense } from "react";
import AddExerciseDataClient from "./AddExerciseDataClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-center text-[#dcddde]">Loading page...</p>}>
      <AddExerciseDataClient />
    </Suspense>
  );
}
