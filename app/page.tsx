"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/auth", {
          credentials: "include",
        });

        const data = await response.json();

        router.replace(data.authenticated ? "/survey" : "/auth");
      } catch {
        router.replace("/auth");
      }
    })();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <LoadingSpinner />
    </div>
  );
}
