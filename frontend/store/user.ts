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
  // Core identity
  businessName: string;
  businessType: BusinessType;
  sector: string;
  location: string;
  email: string;
  isLoggedIn: boolean;

  // Export profile
  exportProducts: string;
  targetMarkets: string[];
  exportStage: ExportStage | "";
  preferredCurrency: string;

  // Compliance focus
  complianceFocus: string[];

  // Readiness
  readinessScore?: number;
  scoreHistory: ScoreHistoryEntry[];

  // Registration status
  hasIEC: boolean;
  isoVerified: boolean;
  onboardingComplete: boolean;

  // Saved items (lightweight bookmarks)
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
        set((state) => ({
          profile: { ...state.profile, ...partial },
        })),

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
          const next = saved.includes(id) ? saved.filter((s) => s !== id) : [...saved, id];
          return { profile: { ...state.profile, savedSchemes: next } };
        }),

      toggleSavedGlossaryTerm: (term) =>
        set((state) => {
          const saved = state.profile.savedGlossaryTerms ?? [];
          const next = saved.includes(term) ? saved.filter((t) => t !== term) : [...saved, term];
          return { profile: { ...state.profile, savedGlossaryTerms: next } };
        }),

      toggleSavedHsCode: (code) =>
        set((state) => {
          const saved = state.profile.savedHsCodes ?? [];
          const next = saved.includes(code) ? saved.filter((c) => c !== code) : [...saved, code];
          return { profile: { ...state.profile, savedHsCodes: next } };
        }),

      toggleSavedCountry: (code) =>
        set((state) => {
          const saved = state.profile.savedCountries ?? [];
          const next = saved.includes(code) ? saved.filter((c) => c !== code) : [...saved, code];
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
      // Merge to handle users with old persisted state that lack new fields
      merge: (persisted, current) => {
        const p = persisted as { profile?: Partial<UserProfile> } | null;
        return {
          ...current,
          profile: {
            ...current.profile,
            ...(p?.profile ?? {}),
            // Ensure new fields exist even for old persisted profiles
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
