import { Suspense } from "react";
import PageClient from "./PageClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-center text-[#dcddde]">Loading page...</p>}>
      <PageClient />
    </Suspense>
  );
}
