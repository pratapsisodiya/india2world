"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Calendar, MapPin, Globe2, Sparkles, ExternalLink, Loader2, Filter } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { useSSE } from "@/hooks/useSSE";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

interface TradeEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  country: string;
  type: "trade-fair" | "buyer-seller-meet" | "exhibition" | "conference";
  sectors: string[];
  organizer: string;
  website: string;
  description: string;
  registrationDeadline?: string;
  isMajor: boolean;
}

const EVENTS: TradeEvent[] = [
  {
    id: "dubai-expo-2025",
    name: "Big 5 Dubai — Construction & Building Materials",
    date: "Nov 24–27, 2025",
    location: "Dubai World Trade Centre",
    country: "UAE",
    type: "trade-fair",
    sectors: ["engineering", "construction", "chemicals"],
    organizer: "Informa Markets",
    website: "https://big5dubai.com",
    description: "Middle East's largest construction and building trade show. Key for Indian engineering goods, tiles, sanitary ware, and building materials exporters.",
    registrationDeadline: "Oct 15, 2025",
    isMajor: true,
  },
  {
    id: "india-international-trade-fair-2025",
    name: "India International Trade Fair (IITF)",
    date: "Nov 14–27, 2025",
    location: "Pragati Maidan, New Delhi",
    country: "India",
    type: "trade-fair",
    sectors: ["all"],
    organizer: "India Trade Promotion Organisation (ITPO)",
    website: "https://www.indiatradefair.com",
    description: "Asia's largest trade fair. Excellent for B2B networking with international buyers across all sectors.",
    isMajor: true,
  },
  {
    id: "canton-fair-2026",
    name: "Canton Fair (China Import & Export Fair)",
    date: "Apr 15 – May 5, 2026",
    location: "Guangzhou, China",
    country: "China",
    type: "trade-fair",
    sectors: ["textiles", "engineering", "electronics", "handicrafts"],
    organizer: "CCPIT / CCOIC",
    website: "https://www.cantonfair.org.cn",
    description: "World's largest trade fair — 200,000+ international buyers. Critical for Indian exporters targeting Asia and global markets.",
    isMajor: true,
  },
  {
    id: "biofach-2026",
    name: "BioFach — World Organic Trade Fair",
    date: "Feb 17–20, 2026",
    location: "Nuremberg, Germany",
    country: "Germany",
    type: "trade-fair",
    sectors: ["spices", "agriculture", "food"],
    organizer: "NürnbergMesse",
    website: "https://www.biofach.de",
    description: "World's leading organic trade fair. Essential for Indian organic spices, superfoods, and agricultural exporters.",
    registrationDeadline: "Dec 1, 2025",
    isMajor: true,
  },
  {
    id: "texworld-paris-2026",
    name: "Texworld Paris — Fabric & Apparel Sourcing",
    date: "Jan 13–16, 2026",
    location: "Paris Le Bourget",
    country: "France",
    type: "trade-fair",
    sectors: ["textiles"],
    organizer: "Messe Frankfurt",
    website: "https://www.texworld.messefrankfurt.com",
    description: "Europe's premier textile sourcing fair. Indian cotton, silk, and technical textile exporters regularly participate.",
    registrationDeadline: "Nov 1, 2025",
    isMajor: true,
  },
  {
    id: "gulfood-2026",
    name: "Gulfood — World's Largest Food & Beverage Trade Show",
    date: "Feb 17–21, 2026",
    location: "Dubai World Trade Centre",
    country: "UAE",
    type: "trade-fair",
    sectors: ["food", "spices", "agriculture"],
    organizer: "Dubai World Trade Centre",
    website: "https://www.gulfood.com",
    description: "World's largest annual food & beverage trade event. Critical for Indian spices, rice, processed foods, and snacks.",
    registrationDeadline: "Dec 15, 2025",
    isMajor: true,
  },
  {
    id: "india-gem-jewellery-show-2025",
    name: "India International Jewellery Show (IIJS)",
    date: "Aug 7–11, 2025",
    location: "Jio World Convention Centre, Mumbai",
    country: "India",
    type: "exhibition",
    sectors: ["gems"],
    organizer: "GJEPC",
    website: "https://www.iijs.org",
    description: "Asia's largest gems & jewellery trade show. Meet global buyers and showcase Indian craftsmanship.",
    isMajor: true,
  },
  {
    id: "pharmapack-2026",
    name: "CPhI Worldwide — Pharma Industry Expo",
    date: "Oct 2026 (TBC)",
    location: "Frankfurt, Germany",
    country: "Germany",
    type: "trade-fair",
    sectors: ["pharma"],
    organizer: "Informa Markets",
    website: "https://www.cphi.com",
    description: "Leading global pharma event. Indian API and formulation exporters use this to meet regulated market buyers.",
    isMajor: false,
  },
  {
    id: "leather-fair-2026",
    name: "Lineapelle — International Leather Exhibition",
    date: "Feb 19–21, 2026",
    location: "Fiera Milano, Italy",
    country: "Italy",
    type: "exhibition",
    sectors: ["leather"],
    organizer: "UNIC / Lineapelle",
    website: "https://www.lineapelle-fair.it",
    description: "World's premier leather exhibition. Indian leather and footwear exporters access top European brands and buyers here.",
    isMajor: false,
  },
  {
    id: "hannover-messe-2026",
    name: "Hannover Messe — Industrial Technology",
    date: "Mar 30 – Apr 3, 2026",
    location: "Hannover, Germany",
    country: "Germany",
    type: "trade-fair",
    sectors: ["engineering", "electronics"],
    organizer: "Deutsche Messe",
    website: "https://www.hannovermesse.de",
    description: "World's leading industrial trade fair. Indian engineering goods and precision component exporters participate under India pavilion.",
    isMajor: true,
  },
  {
    id: "buyer-seller-meet-apeda-2025",
    name: "APEDA Buyer-Seller Meet — Organic & Agri Products",
    date: "Quarterly (check APEDA site)",
    location: "Various cities, India",
    country: "India",
    type: "buyer-seller-meet",
    sectors: ["agriculture", "spices", "food"],
    organizer: "APEDA",
    website: "https://apeda.gov.in",
    description: "APEDA organises B2B meets connecting Indian agri exporters directly with overseas buyers. Free participation for registered exporters.",
    isMajor: false,
  },
  {
    id: "global-gems-jewellery-fair-2026",
    name: "JCK Las Vegas — Jewellery & Gems Show",
    date: "May 30 – Jun 2, 2026",
    location: "Las Vegas, USA",
    country: "USA",
    type: "trade-fair",
    sectors: ["gems"],
    organizer: "RX Jewellery Group",
    website: "https://www.jckonline.com",
    description: "North America's premier jewellery trade show. Critical for Indian diamond and fine jewellery exporters targeting the US market.",
    isMajor: true,
  },
];

const ALL_SECTORS = ["all", "textiles", "spices", "agriculture", "food", "engineering", "gems", "leather", "pharma", "electronics", "handicrafts", "construction", "chemicals"];

const TYPE_LABELS = {
  "trade-fair": "Trade Fair",
  "buyer-seller-meet": "Buyer-Seller Meet",
  "exhibition": "Exhibition",
  "conference": "Conference",
};

const TYPE_COLORS: Record<string, string> = {
  "trade-fair": "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  "buyer-seller-meet": "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  "exhibition": "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
  "conference": "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
};

export default function TradeEventsPage() {
  const [sectorFilter, setSectorFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<TradeEvent | null>(null);
  const [prepAdvice, setPrepAdvice] = useState("");
  const [prepLoading, setPrepLoading] = useState(false);
  const { startStream, stop } = useSSE();

  const filtered = EVENTS.filter((e) =>
    sectorFilter === "all" || e.sectors.includes(sectorFilter) || e.sectors.includes("all")
  );

  function handleGetPrep(event: TradeEvent) {
    setSelectedEvent(event);
    setPrepAdvice("");
    setPrepLoading(true);
    stop();

    startStream(
      `${BACKEND_URL}/api/chat`,
      {
        messages: [{
          role: "user",
          content: `I'm an Indian exporter preparing to exhibit at ${event.name} (${event.date}, ${event.location}). The event focuses on: ${event.sectors.join(", ")}.

Give me a practical 30-day preparation checklist covering:
1. **Documentation** — what export documents, certificates, samples clearance
2. **Booth & materials** — what to bring, brochures, samples
3. **Pre-event outreach** — how to get buyer meetings booked before the show
4. **Budget estimate** — rough cost breakdown for participation
5. **Follow-up plan** — what to do in the 2 weeks after the fair

Be specific and actionable for Indian exporters.`,
        }],
        provider: "openai",
      },
      {
        onEvent: (evt) => {
          if (evt.type === "text" && evt.text) setPrepAdvice((d) => d + evt.text);
        },
        onSuccess: () => setPrepLoading(false),
        onError: () => setPrepLoading(false),
      }
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Trade Events Calendar
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Major international trade fairs, exhibitions, and buyer-seller meets for Indian exporters. Get AI-generated preparation checklists.
          </p>
        </div>

        {/* Sector filter */}
        <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          {ALL_SECTORS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSectorFilter(s)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize",
                sectorFilter === s
                  ? "bg-saffron-500 text-white"
                  : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-700 dark:hover:bg-zinc-800"
              )}
            >
              {s === "all" ? "All sectors" : s}
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Events list */}
          <div className="space-y-3">
            <p className="text-xs text-zinc-400">{filtered.length} event{filtered.length !== 1 ? "s" : ""}</p>
            {filtered.map((event) => (
              <div
                key={event.id}
                className={cn(
                  "rounded-xl bg-white p-5 ring-1 transition-all dark:bg-zinc-900",
                  selectedEvent?.id === event.id
                    ? "ring-saffron-500 dark:ring-saffron-500"
                    : "ring-zinc-200 hover:ring-zinc-300 dark:ring-zinc-800 dark:hover:ring-zinc-700"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {event.isMajor && (
                        <span className="rounded-full bg-saffron-100 px-2 py-0.5 text-[10px] font-bold text-saffron-700 dark:bg-saffron-500/15 dark:text-saffron-400">MAJOR</span>
                      )}
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", TYPE_COLORS[event.type])}>
                        {TYPE_LABELS[event.type]}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{event.name}</h3>
                  </div>
                  <a
                    href={event.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 shrink-0" />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {event.location}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">{event.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {event.sectors.slice(0, 4).map((s) => (
                    <Badge key={s} variant={s === "all" ? "default" : "orange"}>{s === "all" ? "All sectors" : s}</Badge>
                  ))}
                </div>

                {event.registrationDeadline && (
                  <p className="mb-2 text-[10px] font-medium text-red-600 dark:text-red-400">
                    Registration deadline: {event.registrationDeadline}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => handleGetPrep(event)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-saffron-500/10 px-3 py-1.5 text-xs font-semibold text-saffron-700 hover:bg-saffron-500/20 dark:text-saffron-400 dark:hover:bg-saffron-500/20"
                >
                  <Sparkles className="h-3 w-3" />
                  Get AI prep checklist
                </button>
              </div>
            ))}
          </div>

          {/* AI prep panel */}
          <div className="sticky top-4 self-start">
            <div className="rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 overflow-hidden">
              <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {selectedEvent ? `Prep: ${selectedEvent.name}` : "Event Preparation"}
                </h2>
              </div>
              <div className="min-h-80 max-h-[70vh] overflow-y-auto p-5">
                {!selectedEvent && (
                  <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                    <Sparkles className="h-8 w-8 opacity-30 mb-2" />
                    <p className="text-xs text-center">Select an event and click "Get AI prep checklist" to get a personalised 30-day action plan.</p>
                  </div>
                )}
                {prepLoading && !prepAdvice && (
                  <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    <p className="text-xs">Generating preparation plan…</p>
                  </div>
                )}
                {prepAdvice && (
                  <div className="prose prose-sm prose-zinc max-w-none dark:prose-invert prose-li:my-0.5 prose-p:my-1.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{prepAdvice}</ReactMarkdown>
                    {prepLoading && <span className="inline-block h-3 w-0.5 animate-pulse bg-saffron-500 ml-0.5" />}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
