"use client";

import { useEffect, useRef } from "react";
import { useUser, useAuth } from "@clerk/nextjs";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export function UserSync() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const synced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || synced.current) return;
    synced.current = true;

    async function sync() {
      try {
        const token = await getToken();
        if (!token) return;
        await fetch(`${BACKEND_URL}/api/user/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user!.primaryEmailAddress?.emailAddress,
            name: user!.fullName ?? user!.username ?? undefined,
          }),
        });
      } catch {
        // silent — non-blocking
      }
    }
    sync();
  }, [isLoaded, user, getToken]);

  return null;
}
