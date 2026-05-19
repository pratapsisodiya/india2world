"use client";

import { useEffect, useRef } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useUserStore, setGlobalGetToken } from "@/store/user";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export function UserSync() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const synced = useRef(false);
  const setProfile = useUserStore((s) => s.setProfile);
  const setLoggedIn = useUserStore((s) => s.setLoggedIn);

  useEffect(() => {
    setGlobalGetToken(getToken);
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded || !user || synced.current) return;
    synced.current = true;

    async function sync() {
      try {
        const token = await getToken();
        if (!token) return;

        // 1. Sync basic info
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

        // 2. Hydrate profile
        const profileRes = await fetch(`${BACKEND_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile({
            businessName: data.business_name || "",
            businessType: data.business_type || "",
            sector: data.sector || "",
            location: data.location || "",
            exportProducts: data.export_products || "",
            targetMarkets: data.target_markets || [],
            exportStage: data.export_stage || "",
            preferredCurrency: data.preferred_currency || "USD",
            complianceFocus: data.compliance_focus || [],
            hasIEC: data.has_iec || false,
            isoVerified: data.iso_verified || false,
            readinessScore: data.readiness_score,
            onboardingComplete: data.onboarding_complete || false,
          });
          // Mark local store as logged in so UI updates
          setLoggedIn(user!.primaryEmailAddress?.emailAddress ?? user!.emailAddresses?.[0]?.emailAddress ?? "", data.business_name || user!.fullName || undefined);
        }

        // 3. Hydrate saved items (toggles)
        const savedRes = await fetch(`${BACKEND_URL}/api/user/saved`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (savedRes.ok) {
          const savedData = await savedRes.json();
          setProfile({
            savedSchemes: savedData["scheme"] || [],
            savedGlossaryTerms: savedData["glossary"] || [],
            savedHsCodes: savedData["hs-code"] || [],
            savedCountries: savedData["country"] || [],
          });
        }

      } catch {
        // silent — non-blocking
      }
    }
    sync();
  }, [isLoaded, user, getToken, setProfile]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="space-y-3">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-48 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
        </div>
      </div>
    );
  }

  return null;
}
