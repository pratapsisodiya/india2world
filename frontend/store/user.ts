import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ExportStage = "planning" | "registered" | "first-shipment" | "scaling";
export type BusinessType = "manufacturer" | "trader" | "merchant-exporter" | "service" | "";

export interface ScoreHistoryEntry {
  score: number;
  sector: string;
  ts: number;
}

export interface UserProfile {
  businessName: string;
  businessType: BusinessType;
  sector: string;
  location: string;
  email: string;
  isLoggedIn: boolean;
  exportProducts: string;
  targetMarkets: string[];
  exportStage: ExportStage | "";
  preferredCurrency: string;
  complianceFocus: string[];
  readinessScore?: number;
  scoreHistory: ScoreHistoryEntry[];
  hasIEC: boolean;
  isoVerified: boolean;
  onboardingComplete: boolean;
  savedSchemes: string[];
  savedGlossaryTerms: string[];
  savedHsCodes: string[];
  savedCountries: string[];
}

interface UserState {
  profile: UserProfile;
  setProfile: (partial: Partial<UserProfile>) => void;
  setLoggedIn: (email: string, businessName?: string) => void;
  logout: () => void;
  pushScoreHistory: (entry: ScoreHistoryEntry) => void;
  toggleSavedScheme: (id: string) => void;
  toggleSavedGlossaryTerm: (term: string) => void;
  toggleSavedHsCode: (code: string) => void;
  toggleSavedCountry: (code: string) => void;
}

// Global auth token getter set by UserSync component
export let globalGetToken: (() => Promise<string | null>) | null = null;
export function setGlobalGetToken(fn: () => Promise<string | null>) {
  globalGetToken = fn;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

async function pushProfile(profile: Partial<UserProfile>) {
  if (typeof window === 'undefined') return;
  if (!globalGetToken) return;
  const token = await globalGetToken();
  if (!token) return;
  
  const payload = {
    business_name: profile.businessName,
    business_type: profile.businessType,
    sector: profile.sector,
    location: profile.location,
    export_products: profile.exportProducts,
    target_markets: profile.targetMarkets,
    export_stage: profile.exportStage,
    preferred_currency: profile.preferredCurrency,
    compliance_focus: profile.complianceFocus,
    has_iec: profile.hasIEC,
    iso_verified: profile.isoVerified,
    readiness_score: profile.readinessScore,
    onboarding_complete: profile.onboardingComplete,
  };
  
  // Remove undefined values
  Object.keys(payload).forEach((key) => payload[key as keyof typeof payload] === undefined && delete payload[key as keyof typeof payload]);

  await fetch(`${BACKEND_URL}/api/user/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }).catch(() => {}); // silent
}

async function syncSavedItem(type: string, id: string, action: "add" | "remove") {
  if (typeof window === 'undefined') return;
  if (!globalGetToken) return;
  const token = await globalGetToken();
  if (!token) return;
  
  await fetch(`${BACKEND_URL}/api/user/saved`, {
    method: action === "add" ? "POST" : "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ item_type: type, item_id: id }),
  }).catch(() => {}); // silent
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: {
        businessName: "",
        businessType: "",
        sector: "",
        location: "",
        email: "",
        isLoggedIn: false,
        exportProducts: "",
        targetMarkets: [],
        exportStage: "",
        preferredCurrency: "USD",
        complianceFocus: [],
        scoreHistory: [],
        hasIEC: false,
        isoVerified: false,
        onboardingComplete: false,
        savedSchemes: [],
        savedGlossaryTerms: [],
        savedHsCodes: [],
        savedCountries: [],
      },

      setProfile: (partial) =>
        set((state) => {
          const next = { ...state.profile, ...partial };
          // Don't await, run in background
          pushProfile(next);
          return { profile: next };
        }),

      pushScoreHistory: (entry) =>
        set((state) => ({
          profile: {
            ...state.profile,
            scoreHistory: [entry, ...state.profile.scoreHistory].slice(0, 5),
          },
        })),

      toggleSavedScheme: (id) =>
        set((state) => {
          const saved = state.profile.savedSchemes ?? [];
          const exists = saved.includes(id);
          const next = exists ? saved.filter((s) => s !== id) : [...saved, id];
          syncSavedItem("scheme", id, exists ? "remove" : "add");
          return { profile: { ...state.profile, savedSchemes: next } };
        }),

      toggleSavedGlossaryTerm: (term) =>
        set((state) => {
          const saved = state.profile.savedGlossaryTerms ?? [];
          const exists = saved.includes(term);
          const next = exists ? saved.filter((t) => t !== term) : [...saved, term];
          syncSavedItem("glossary", term, exists ? "remove" : "add");
          return { profile: { ...state.profile, savedGlossaryTerms: next } };
        }),

      toggleSavedHsCode: (code) =>
        set((state) => {
          const saved = state.profile.savedHsCodes ?? [];
          const exists = saved.includes(code);
          const next = exists ? saved.filter((c) => c !== code) : [...saved, code];
          syncSavedItem("hs-code", code, exists ? "remove" : "add");
          return { profile: { ...state.profile, savedHsCodes: next } };
        }),

      toggleSavedCountry: (code) =>
        set((state) => {
          const saved = state.profile.savedCountries ?? [];
          const exists = saved.includes(code);
          const next = exists ? saved.filter((c) => c !== code) : [...saved, code];
          syncSavedItem("country", code, exists ? "remove" : "add");
          return { profile: { ...state.profile, savedCountries: next } };
        }),

      setLoggedIn: (email, businessName) =>
        set((state) => ({
          profile: {
            ...state.profile,
            email,
            isLoggedIn: true,
            businessName: businessName ?? state.profile.businessName,
          },
        })),

      logout: () =>
        set((state) => ({
          profile: {
            ...state.profile,
            isLoggedIn: false,
            email: "",
          },
        })),
    }),
    {
      name: "india2world-user",
      merge: (persisted, current) => {
        const p = persisted as { profile?: Partial<UserProfile> } | null;
        return {
          ...current,
          profile: {
            ...current.profile,
            ...(p?.profile ?? {}),
            businessType: p?.profile?.businessType ?? "",
            preferredCurrency: p?.profile?.preferredCurrency ?? "USD",
            complianceFocus: p?.profile?.complianceFocus ?? [],
            savedHsCodes: p?.profile?.savedHsCodes ?? [],
            savedCountries: p?.profile?.savedCountries ?? [],
            hasIEC: p?.profile?.hasIEC ?? false,
            isoVerified: p?.profile?.isoVerified ?? false,
            onboardingComplete: p?.profile?.onboardingComplete ?? false,
          },
        };
      },
    }
  )
);

export const AuthService = {
  async login(email: string, _password?: string) {
    await new Promise((r) => setTimeout(r, 600));
    useUserStore.getState().setLoggedIn(email);
  },

  async signup(data: { email: string; password?: string; name?: string; sector?: string; businessType?: BusinessType }) {
    await new Promise((r) => setTimeout(r, 600));
    const store = useUserStore.getState();
    if (data.name || data.sector || data.businessType) {
      store.setProfile({
        businessName: data.name || "",
        sector: data.sector || "",
        businessType: data.businessType || "",
      });
    }
    store.setLoggedIn(data.email, data.name);
  },

  async logout() {
    await new Promise((r) => setTimeout(r, 200));
    useUserStore.getState().logout();
  },
};
