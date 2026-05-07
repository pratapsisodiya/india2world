"use client";

import { cn } from "@/lib/cn";

export type DocumentItem = {
  document: string;
  mandatory: boolean;
  issuedBy: string;
  estimatedDays: string;
  estimatedCost: string;
  notes: string;
};

interface ChecklistTableProps {
  items: DocumentItem[];
  productLabel: string;
  countryLabel: string;
}

export function ChecklistTable({ items, productLabel, countryLabel }: ChecklistTableProps) {
  const mandatory = items.filter((i) => i.mandatory);
  const optional = items.filter((i) => !i.mandatory);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {productLabel} → {countryLabel}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {mandatory.length} mandatory · {optional.length} recommended
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 print:hidden"
        >
          Print / Save PDF
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {mandatory.length > 0 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Mandatory</p>
            {mandatory.map((item, i) => (
              <ChecklistRow key={i} item={item} />
            ))}
          </>
        )}
        {optional.length > 0 && (
          <>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Recommended</p>
            {optional.map((item, i) => (
              <ChecklistRow key={i} item={item} />
            ))}
          </>
        )}
      </div>

      <p className="mt-4 text-xs text-zinc-400">
        AI-generated guidance — verify requirements with DGFT, your customs broker, or the destination country&apos;s customs authority before shipping.
      </p>
    </div>
  );
}

function ChecklistRow({ item }: { item: DocumentItem }) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
              item.mandatory
                ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            )}>
              {item.mandatory ? "Mandatory" : "Recommended"}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{item.document}</h3>
          <p className="mt-0.5 text-xs text-zinc-500">{item.issuedBy}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{item.estimatedDays}</p>
          <p className="text-xs text-zinc-500">{item.estimatedCost}</p>
        </div>
      </div>
      {item.notes && (
        <p className="mt-2 border-t border-zinc-100 pt-2 text-xs text-zinc-500 dark:border-zinc-800">
          {item.notes}
        </p>
      )}
    </div>
  );
}
