export function cleanJson(s: string): string { const match = s.match(/```(?:json)?\s*([\s\S]*?)```/); return match ? match[1].trim() : s.trim(); }
