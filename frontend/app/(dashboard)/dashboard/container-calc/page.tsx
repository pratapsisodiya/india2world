"use client";

import { useState, useMemo } from "react";
import {
  Container,
  Package,
  Weight,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";

interface ContainerSpec {
  id: string;
  label: string;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  maxWeightKg: number;
  cbm: number;
  note: string;
}

const CONTAINERS: ContainerSpec[] = [
  { id: "20std", label: "20' Standard", lengthMm: 5895, widthMm: 2350, heightMm: 2390, maxWeightKg: 21800, cbm: 33.1, note: "Most common for dense/heavy goods" },
  { id: "40std", label: "40' Standard", lengthMm: 12032, widthMm: 2350, heightMm: 2390, maxWeightKg: 26680, cbm: 67.5, note: "Best for volumetric goods" },
  { id: "40hc", label: "40' High Cube", lengthMm: 12032, widthMm: 2350, heightMm: 2698, maxWeightKg: 26460, cbm: 76.3, note: "Extra height for tall/light goods" },
  { id: "lcl", label: "LCL (per CBM)", lengthMm: 0, widthMm: 0, heightMm: 0, maxWeightKg: 0, cbm: 0, note: "Charged per CBM, ideal below 15 CBM" },
];

function calcBoxesForContainer(
  spec: ContainerSpec,
  lMm: number, wMm: number, hMm: number
): number {
  if (!lMm || !wMm || !hMm || !spec.lengthMm) return 0;
  // Try all 6 orientations of the box
  const dims = [lMm, wMm, hMm];
  const perms: [number, number, number][] = [
    [dims[0], dims[1], dims[2]],
    [dims[0], dims[2], dims[1]],
    [dims[1], dims[0], dims[2]],
    [dims[1], dims[2], dims[0]],
    [dims[2], dims[0], dims[1]],
    [dims[2], dims[1], dims[0]],
  ];
  let best = 0;
  for (const [bl, bw, bh] of perms) {
    const count = Math.floor(spec.lengthMm / bl) *
      Math.floor(spec.widthMm / bw) *
      Math.floor(spec.heightMm / bh);
    if (count > best) best = count;
  }
  return best;
}

function utilPct(boxes: number, totalBoxes: number) {
  if (!totalBoxes) return 0;
  return Math.min(Math.round((boxes / totalBoxes) * 100), 100);
}

export default function ContainerCalcPage() {
  const [boxL, setBoxL] = useState("");
  const [boxW, setBoxW] = useState("");
  const [boxH, setBoxH] = useState("");
  const [boxWeightKg, setBoxWeightKg] = useState("");
  const [unitsPerBox, setUnitsPerBox] = useState("1");
  const [targetUnits, setTargetUnits] = useState("");
  const [lclRate, setLclRate] = useState("18");
  const [showRef, setShowRef] = useState(false);

  const lMm = (parseFloat(boxL) || 0) * 10;
  const wMm = (parseFloat(boxW) || 0) * 10;
  const hMm = (parseFloat(boxH) || 0) * 10;
  const weightKg = parseFloat(boxWeightKg) || 0;
  const upb = Math.max(parseFloat(unitsPerBox) || 1, 1);
  const target = parseFloat(targetUnits) || 0;
  const hasData = lMm > 0 && wMm > 0 && hMm > 0;

  const results = useMemo(() => {
    if (!hasData) return null;
    const boxCbm = (lMm * wMm * hMm) / 1_000_000_000;
    return CONTAINERS.slice(0, 3).map((spec) => {
      const boxes = calcBoxesForContainer(spec, lMm, wMm, hMm);
      const totalWeight = boxes * weightKg;
      const usedCbm = boxes * boxCbm;
      const volUtil = spec.cbm > 0 ? Math.min((usedCbm / spec.cbm) * 100, 100) : 0;
      const wtUtil = spec.maxWeightKg > 0 ? Math.min((totalWeight / spec.maxWeightKg) * 100, 100) : 0;
      const limitingFactor = volUtil >= wtUtil ? "volume" : "weight";
      const units = boxes * upb;
      const boxesNeededForTarget = target > 0 ? Math.ceil(target / upb) : 0;
      const containersForTarget = target > 0 ? Math.ceil(boxesNeededForTarget / Math.max(boxes, 1)) : 0;

      return {
        ...spec,
        boxes,
        totalWeight,
        usedCbm,
        volUtil,
        wtUtil,
        limitingFactor,
        units,
        boxesNeededForTarget,
        containersForTarget,
        boxCbm,
      };
    });
  }, [lMm, wMm, hMm, weightKg, upb, target, hasData]);

  const boxCbm = lMm > 0 ? (lMm * wMm * hMm) / 1_000_000_000 : 0;
  const lclCbmRate = parseFloat(lclRate) || 18;

  // LCL cost for target units
  const lclBoxes = target > 0 ? Math.ceil(target / upb) : 0;
  const lclTotalCbm = lclBoxes * boxCbm;
  const lclCost = lclTotalCbm * lclCbmRate;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Container className="h-5 w-5 text-saffron-500" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Container Load Calculator
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Find how many cartons fit in a 20', 40', or 40'HC container. Compare FCL vs LCL cost.
          </p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
          {/* Inputs */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Carton / Outer Box Dimensions
            </h2>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Length (cm)", value: boxL, set: setBoxL },
                { label: "Width (cm)", value: boxW, set: setBoxW },
                { label: "Height (cm)", value: boxH, set: setBoxH },
              ].map((f) => (
                <div key={f.label} className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{f.label}</label>
                  <input
                    type="number"
                    min="0"
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder="0"
                    className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400 tabular-nums"
                  />
                </div>
              ))}
            </div>

            {boxCbm > 0 && (
              <p className="text-xs text-zinc-400">
                Box volume: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{boxCbm.toFixed(4)} CBM</span>
              </p>
            )}

            <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Box weight (kg)
                </label>
                <div className="relative">
                  <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                  <input
                    type="number"
                    min="0"
                    value={boxWeightKg}
                    onChange={(e) => setBoxWeightKg(e.target.value)}
                    placeholder="e.g. 12"
                    className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-8 pr-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Units per box
                </label>
                <input
                  type="number"
                  min="1"
                  value={unitsPerBox}
                  onChange={(e) => setUnitsPerBox(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-50 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400"
                />
              </div>
            </div>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Target order quantity (units) — <span className="font-normal text-zinc-400">optional</span>
              </label>
              <input
                type="number"
                min="0"
                value={targetUnits}
                onChange={(e) => setTargetUnits(e.target.value)}
                placeholder="e.g. 5000 units"
                className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                LCL rate (USD/CBM)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 pointer-events-none">$</span>
                <input
                  type="number"
                  min="0"
                  value={lclRate}
                  onChange={(e) => setLclRate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-7 pr-3 text-sm text-zinc-900 dark:text-zinc-50 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex flex-col gap-4">
            {!hasData ? (
              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-10 flex flex-col items-center justify-center text-center">
                <Container className="h-12 w-12 text-zinc-200 dark:text-zinc-700 mb-3" />
                <p className="text-sm text-zinc-400">Enter box dimensions to see how many fit per container.</p>
              </div>
            ) : (
              <>
                {results?.map((res) => {
                  const isWeightLimited = res.limitingFactor === "weight" && weightKg > 0;
                  const isOverweight = res.wtUtil > 100;
                  const bestOption = results.reduce((a, b) =>
                    (b.boxes / b.cbm) > (a.boxes / a.cbm) ? b : a
                  );
                  const isBest = res.id === bestOption.id;

                  return (
                    <div
                      key={res.id}
                      className={`rounded-2xl bg-white dark:bg-zinc-900 border overflow-hidden ${
                        isBest
                          ? "border-india-green-400 dark:border-india-green-700"
                          : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          isBest ? "bg-india-green-100 dark:bg-india-green-900/30" : "bg-zinc-100 dark:bg-zinc-800"
                        }`}>
                          <Container className={`h-4 w-4 ${isBest ? "text-india-green-600 dark:text-india-green-400" : "text-zinc-500"}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{res.label}</p>
                            {isBest && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-india-green-100 text-india-green-700 dark:bg-india-green-900/30 dark:text-india-green-400">
                                Best fit
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400">{res.note}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">{res.boxes.toLocaleString()}</p>
                          <p className="text-xs text-zinc-400">boxes</p>
                        </div>
                      </div>

                      <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Stat label="Units" value={(res.boxes * upb).toLocaleString()} />
                        <Stat label="Used CBM" value={`${res.usedCbm.toFixed(1)} / ${res.cbm}`} />
                        <Stat
                          label="Vol utilization"
                          value={`${res.volUtil.toFixed(0)}%`}
                          color={res.volUtil > 85 ? "text-india-green-600 dark:text-india-green-400" : undefined}
                        />
                        {weightKg > 0 ? (
                          <Stat
                            label="Weight"
                            value={`${(res.totalWeight / 1000).toFixed(1)}t / ${res.maxWeightKg / 1000}t`}
                            color={isOverweight ? "text-red-600 dark:text-red-400" : undefined}
                          />
                        ) : (
                          <Stat label="Max payload" value={`${res.maxWeightKg / 1000}t`} />
                        )}
                      </div>

                      {/* Progress bars */}
                      <div className="px-5 pb-4 flex flex-col gap-2">
                        <UtilBar label="Volume" pct={res.volUtil} color="bg-saffron-500" />
                        {weightKg > 0 && (
                          <UtilBar label="Weight" pct={res.wtUtil} color={isOverweight ? "bg-red-500" : "bg-blue-500"} />
                        )}
                      </div>

                      {/* Target shipment info */}
                      {target > 0 && res.boxes > 0 && (
                        <div className="px-5 pb-4 rounded-b-2xl bg-zinc-50 dark:bg-zinc-800/50 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                          <p className="text-xs text-zinc-400 mb-2">For {target.toLocaleString()} units:</p>
                          <div className="flex gap-4 flex-wrap">
                            <div className="text-sm">
                              <span className="text-zinc-500">Boxes needed:</span>{" "}
                              <span className="font-semibold text-zinc-900 dark:text-zinc-50">{res.boxesNeededForTarget.toLocaleString()}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-zinc-500">{res.label}s needed:</span>{" "}
                              <span className="font-bold text-saffron-600 dark:text-saffron-400">{res.containersForTarget}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {isWeightLimited && res.wtUtil > 90 && (
                        <div className="mx-5 mb-4 flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 px-3 py-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                          <p className="text-xs text-amber-700 dark:text-amber-400">
                            {isOverweight ? "Shipment exceeds container weight limit." : "Approaching weight limit — verify with shipping line."}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* LCL card */}
                {target > 0 && boxCbm > 0 && (
                  <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">LCL (Groupage)</p>
                        <p className="text-xs text-zinc-400">Pays per CBM — no full container needed</p>
                      </div>
                      {lclTotalCbm < 15 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-saffron-100 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-400">
                          Recommended for this size
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                      <Stat label="Total CBM" value={lclTotalCbm.toFixed(2)} />
                      <Stat label="Est. freight cost" value={`USD ${lclCost.toFixed(0)}`} />
                      <Stat label="Rate" value={`USD ${lclCbmRate}/CBM`} />
                    </div>
                    <div className="mt-3 flex items-start gap-2">
                      <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-zinc-400">
                        LCL is typically cost-effective below 15 CBM. Above 15 CBM, compare with FCL freight rates from your forwarder.
                        LCL has longer transit times (+3–5 days for consolidation/deconsolidation).
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Reference table */}
        <div className="mt-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <button
            onClick={() => setShowRef((p) => !p)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Container Dimensions Reference</span>
            {showRef ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
          </button>
          {showRef && (
            <div className="px-6 pb-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    {["Type", "Internal L", "Internal W", "Internal H", "Volume (CBM)", "Max Payload", "Best for"].map((h) => (
                      <th key={h} className="text-left py-2 text-xs font-semibold text-zinc-500 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: "20' Standard", l: "5.895m", w: "2.350m", h: "2.390m", cbm: "33.1", wt: "21,800 kg", best: "Dense/heavy goods" },
                    { type: "40' Standard", l: "12.032m", w: "2.350m", h: "2.390m", cbm: "67.5", wt: "26,680 kg", best: "Light/bulky goods" },
                    { type: "40' High Cube", l: "12.032m", w: "2.350m", h: "2.698m", cbm: "76.3", wt: "26,460 kg", best: "Tall/light goods" },
                    { type: "20' Reefer", l: "5.444m", w: "2.268m", h: "2.255m", cbm: "28.0", wt: "27,400 kg", best: "Perishable goods" },
                    { type: "LCL", l: "—", w: "—", h: "—", cbm: "per CBM", wt: "per CBM", best: "< 15 CBM shipments" },
                  ].map((row) => (
                    <tr key={row.type} className="border-b border-zinc-50 dark:border-zinc-800/50">
                      <td className="py-2.5 font-medium text-zinc-800 dark:text-zinc-200 pr-4">{row.type}</td>
                      <td className="py-2.5 tabular-nums text-zinc-600 dark:text-zinc-400 pr-4">{row.l}</td>
                      <td className="py-2.5 tabular-nums text-zinc-600 dark:text-zinc-400 pr-4">{row.w}</td>
                      <td className="py-2.5 tabular-nums text-zinc-600 dark:text-zinc-400 pr-4">{row.h}</td>
                      <td className="py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 pr-4">{row.cbm}</td>
                      <td className="py-2.5 text-zinc-600 dark:text-zinc-400 pr-4">{row.wt}</td>
                      <td className="py-2.5 text-xs text-zinc-400">{row.best}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-0.5">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${color ?? "text-zinc-800 dark:text-zinc-100"}`}>{value}</p>
    </div>
  );
}

function UtilBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  const clamped = Math.min(Math.max(pct, 0), 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-zinc-400 w-12 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-[10px] font-semibold text-zinc-500 w-8 text-right shrink-0">{pct.toFixed(0)}%</span>
    </div>
  );
}
