import type { UserProfile } from "../types";

export function buildProfileContext(userProfile: UserProfile): string {
  if (!userProfile) return "";
  const parts: string[] = [];
  if (userProfile.businessName) parts.push(`Business: ${userProfile.businessName}`);
  if (userProfile.sector) parts.push(`Sector: ${userProfile.sector}`);
  if (userProfile.location) parts.push(`Location: ${userProfile.location}`);
  if (userProfile.exportProducts) parts.push(`Products: ${userProfile.exportProducts}`);
  if (userProfile.targetMarkets?.length)
    parts.push(`Target markets: ${userProfile.targetMarkets.join(", ")}`);
  if (userProfile.exportStage) parts.push(`Export stage: ${userProfile.exportStage}`);
  if (userProfile.annualTurnover) parts.push(`Annual turnover: ${userProfile.annualTurnover}`);
  if (userProfile.hasIEC !== undefined) parts.push(`Has IEC: ${userProfile.hasIEC ? "Yes" : "No"}`);
  if (userProfile.hasGST !== undefined) parts.push(`Has GST: ${userProfile.hasGST ? "Yes" : "No"}`);
  if (!parts.length) return "";
  return (
    "## Exporter Profile\nYou are speaking with this specific exporter — tailor all responses to their context:\n" +
    parts.join("\n")
  );
}
