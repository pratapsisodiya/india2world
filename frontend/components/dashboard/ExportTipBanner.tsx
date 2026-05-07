"use client";

import { useEffect, useState } from "react";
import { Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";

const TIPS = [
  "Always declare the correct HS code — misdeclaration can result in penalty under Section 111 of Customs Act.",
  "GST LUT (Letter of Undertaking) lets you export without paying GST upfront. File it online on the GST portal before your first shipment.",
  "The RoDTEP scheme refunds embedded taxes not covered by other schemes — apply via ICEGATE after filing the shipping bill.",
  "EPCG licence allows import of capital goods at zero customs duty against an export obligation of 6× the duty saved.",
  "APEDA registration is mandatory for exporting agricultural products like fresh fruits, vegetables, and processed foods.",
  "Use the CEPA India–UAE agreement to get zero duty on most goods — ensure your Certificate of Origin is from APEDA or designated authority.",
  "Free Sale Certificate from CDSCO is required for exporting cosmetics and medical devices to many markets.",
  "Keep your IEC (Importer Exporter Code) updated — your bank and AD Code must match for shipping bill filing on ICEGATE.",
  "Duty Drawback rates are notified annually by CBIC — check the latest schedule to maximise your refund.",
  "For pharma exports, ensure WHO-GMP certification is in place — it's mandatory for regulated markets like EU and USA.",
];

export function ExportTipBanner() {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => rotateTo((idx + 1) % TIPS.length), 8000);
    return () => clearInterval(timer);
  }, [idx]);

  function rotateTo(next: number) {
    setFading(true);
    setTimeout(() => {
      setIdx(next);
      setFading(false);
    }, 200);
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-saffron-50 px-4 py-3 ring-1 ring-saffron-200 dark:bg-saffron-500/10 dark:ring-saffron-500/20">
      <Lightbulb className="h-4 w-4 shrink-0 text-saffron-500" />
      <p
        className={`flex-1 text-sm text-zinc-700 transition-opacity duration-200 dark:text-zinc-300 ${fading ? "opacity-0" : "opacity-100"}`}
      >
        <span className="mr-1.5 text-[10px] font-semibold uppercase tracking-wider text-saffron-600 dark:text-saffron-400">
          Tip
        </span>
        {TIPS[idx]}
      </p>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => rotateTo((idx - 1 + TIPS.length) % TIPS.length)}
          aria-label="Previous tip"
          className="rounded p-0.5 text-saffron-400 hover:text-saffron-600 dark:hover:text-saffron-300"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[10px] tabular-nums text-saffron-400">
          {idx + 1}/{TIPS.length}
        </span>
        <button
          type="button"
          onClick={() => rotateTo((idx + 1) % TIPS.length)}
          aria-label="Next tip"
          className="rounded p-0.5 text-saffron-400 hover:text-saffron-600 dark:hover:text-saffron-300"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
