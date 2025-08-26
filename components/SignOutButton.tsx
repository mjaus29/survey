"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        body: JSON.stringify({ action: "sign-out" }),
        headers: { "Content-Type": "application/json" },
      });

      router.replace("/auth");
    } catch {
      console.error("Sign out failed");
    }
  };

  return (
    <Button
      style={{ position: "absolute", top: 24, right: 32, zIndex: 10 }}
      onClick={handleSignOut}
      className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-full"
    >
      Sign Out
    </Button>
  );
}
