"use client";

import { useState, useEffect } from "react";
import {
  ClipboardList,
  Plus,
  Trash2,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

interface Registration {
  id: string;
  typeId: string;
  number: string;
  issueDate: string;
  expiryDate: string;
  notes: string;
  addedAt: number;
}

interface RegType {
  id: string;
  name: string;
  fullName: string;
  authority: string;
  validity: string;
  cost: string;
  link: string;
  how: string;
  docs: string[];
  required: "mandatory" | "conditional" | "optional";
  category: "basic" | "sector" | "finance" | "compliance";
}

const REG_TYPES: RegType[] = [
  {
    id: "iec",
    name: "IEC",
    fullName: "Import Export Code",
    authority: "DGFT",
    validity: "Lifetime (no renewal, but annual update required)",
    cost: "₹500",
    link: "https://dgft.gov.in",
    how: "Apply online at DGFT portal with DSC or Aadhar OTP. Approved within 1–2 working days.",
    docs: ["PAN card", "Aadhar/Passport", "Bank account + cancelled cheque", "Utility bill (address proof)", "Digital signature (Class 2/3)"],
    required: "mandatory",
    category: "basic",
  },
  {
    id: "gstin",
    name: "GSTIN",
    fullName: "GST Registration",
    authority: "GST Council / State Tax Dept",
    validity: "Lifetime (until cancelled)",
    cost: "Free",
    link: "https://www.gst.gov.in",
    how: "Register at gst.gov.in. Required if turnover > ₹20L (₹10L for special category states). Export businesses should register regardless of turnover to claim ITC.",
    docs: ["PAN", "Aadhar", "Business registration proof", "Bank details", "Address proof of place of business"],
    required: "mandatory",
    category: "basic",
  },
  {
    id: "lut",
    name: "GST LUT",
    fullName: "GST Letter of Undertaking",
    authority: "GST Department",
    validity: "Annual (1 April – 31 March financial year)",
    cost: "Free",
    link: "https://www.gst.gov.in",
    how: "File online at GST portal → Services → User Services → Furnish Letter of Undertaking. Must be done before first export of the financial year. Auto-renewed once filed for a new FY.",
    docs: ["GSTIN", "Export order / previous year exports", "DSC or EVC"],
    required: "mandatory",
    category: "basic",
  },
  {
    id: "rcmc",
    name: "RCMC",
    fullName: "Registration-cum-Membership Certificate",
    authority: "Export Promotion Council (relevant EPC)",
    validity: "5 years (varies by EPC — some annual)",
    cost: "₹2,500–₹15,000 depending on EPC",
    link: "https://www.apeda.gov.in",
    how: "Apply to the relevant Export Promotion Council (APEDA for agri, EEPC for engineering, FIEO for all). Required to claim MEIS/RoDTEP, attend trade fairs under MAI/MDA schemes.",
    docs: ["IEC copy", "GSTIN", "Bank certificate", "Import-export details", "Constitution certificate"],
    required: "mandatory",
    category: "basic",
  },
  {
    id: "ad-code",
    name: "AD Code",
    fullName: "Authorised Dealer Code",
    authority: "Bank / RBI",
    validity: "Lifetime (bank-specific)",
    cost: "Free (bank may charge small fee)",
    link: "https://www.rbi.org.in",
    how: "Submit letter to your AD bank (the bank through which you'll receive export proceeds). Bank registers on ICEGATE. Required before filing any Shipping Bill.",
    docs: ["Bank account details", "IEC copy", "Company registration documents"],
    required: "mandatory",
    category: "basic",
  },
  {
    id: "apeda",
    name: "APEDA",
    fullName: "APEDA Registration",
    authority: "Agricultural & Processed Food Export Development Authority",
    validity: "Annual (renewable)",
    cost: "₹5,000",
    link: "https://www.apeda.gov.in",
    how: "Register at apeda.gov.in. Mandatory for exporters of scheduled products: fresh fruits, vegetables, processed food, dairy, poultry, cereal preparations, alcoholic beverages.",
    docs: ["IEC", "GSTIN", "Bank certificate", "RCMC (if applicable)", "Address proof"],
    required: "conditional",
    category: "sector",
  },
  {
    id: "fssai",
    name: "FSSAI",
    fullName: "Food Safety & Standards Authority of India",
    authority: "FSSAI",
    validity: "1–5 years (based on license type)",
    cost: "₹100–₹7,500 depending on license type",
    link: "https://www.fssai.gov.in",
    how: "Apply at fssai.gov.in. Mandatory for all food business operators. Export license (Central License) for exporters with turnover > ₹20 Cr. Below that, State License applies.",
    docs: ["PAN", "Photo ID", "Business premises proof", "Water test report", "Layout of premises"],
    required: "conditional",
    category: "sector",
  },
  {
    id: "mpeda",
    name: "MPEDA",
    fullName: "Marine Products Export Development Authority",
    authority: "MPEDA",
    validity: "Annual",
    cost: "₹3,000–₹15,000",
    link: "https://mpeda.gov.in",
    how: "Mandatory for exporters of fish, shrimp, crab, lobster, squid, and other marine products. Apply at mpeda.gov.in.",
    docs: ["IEC", "GSTIN", "FSSAI license", "Cold storage/processing facility proof"],
    required: "conditional",
    category: "sector",
  },
  {
    id: "spices-board",
    name: "Spices Board",
    fullName: "Spices Board Certificate",
    authority: "Spices Board of India",
    validity: "Annual",
    cost: "₹1,500–₹5,000",
    link: "https://www.indianspices.com",
    how: "Mandatory for exporters of cardamom, pepper, ginger, turmeric, and other scheduled spices. Apply at indianspices.com.",
    docs: ["IEC", "GSTIN", "RCMC", "Sample test reports"],
    required: "conditional",
    category: "sector",
  },
  {
    id: "epcg",
    name: "EPCG License",
    fullName: "Export Promotion Capital Goods License",
    authority: "DGFT",
    validity: "6 years (export obligation period)",
    cost: "Application fee: 0.1% of duty saved",
    link: "https://dgft.gov.in",
    how: "Apply at DGFT portal. Import capital goods at zero/concessional duty against export obligation of 6× duty saved in 6 years.",
    docs: ["IEC", "GSTIN", "CA certificate of export performance", "Details of capital goods to import"],
    required: "optional",
    category: "compliance",
  },
  {
    id: "drawback",
    name: "Drawback A/C",
    fullName: "Duty Drawback Bank Account",
    authority: "Customs / ICEGATE",
    validity: "Lifetime (linked to IEC)",
    cost: "Free",
    link: "https://www.icegate.gov.in",
    how: "Link your bank account on ICEGATE portal. Required for receiving Duty Drawback and RoDTEP scrip credits electronically.",
    docs: ["IEC", "Bank account details", "Cancelled cheque"],
    required: "mandatory",
    category: "finance",
  },
  {
    id: "ecgc",
    name: "ECGC Policy",
    fullName: "ECGC Export Credit Insurance",
    authority: "Export Credit Guarantee Corporation",
    validity: "1 year (renewable)",
    cost: "Premium: 0.55–1.4% of export turnover",
    link: "https://www.ecgc.in",
    how: "Apply at ecgc.in or through your bank. ECIB (Short-Term) covers buyer default. Required by most banks for export credit.",
    docs: ["IEC", "GSTIN", "Export order samples", "Bank reference", "Audited P&L (2 years)"],
    required: "optional",
    category: "finance",
  },
];

const STORAGE_KEY = "india2world-registrations";

function loadFromStorage(): Registration[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveToStorage(regs: Registration[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(regs));
}

function getDaysUntilExpiry(expiryDate: string): number | null {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate).getTime();
  const now = Date.now();
  return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
}

function StatusBadge({ days, hasExpiry }: { days: number | null; hasExpiry: boolean }) {
  if (!hasExpiry) return (
    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-india-green-100 text-india-green-700 dark:bg-india-green-900/30 dark:text-india-green-400">
      <CheckCircle2 className="h-3 w-3" />
      Lifetime
    </span>
  );
  if (days === null) return null;
  if (days < 0) return (
    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      <XCircle className="h-3 w-3" />
      Expired
    </span>
  );
  if (days <= 30) return (
    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      <AlertTriangle className="h-3 w-3" />
      Expiring in {days}d
    </span>
  );
  if (days <= 90) return (
    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-saffron-100 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-400">
      <Clock className="h-3 w-3" />
      {days}d remaining
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-india-green-100 text-india-green-700 dark:bg-india-green-900/30 dark:text-india-green-400">
      <CheckCircle2 className="h-3 w-3" />
      Valid · {days}d
    </span>
  );
}

const CAT_LABELS: Record<string, string> = {
  basic: "Core Registrations",
  sector: "Sector-specific",
  finance: "Finance & Insurance",
  compliance: "Incentive Licenses",
};

export default function RegistrationsPage() {
  const [myRegs, setMyRegs] = useState<Registration[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"tracker" | "guide">("tracker");

  // New registration form
  const [formType, setFormType] = useState("");
  const [formNumber, setFormNumber] = useState("");
  const [formIssue, setFormIssue] = useState("");
  const [formExpiry, setFormExpiry] = useState("");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    setMyRegs(loadFromStorage());
  }, []);

  function addReg() {
    if (!formType || !formNumber) return;
    const reg: Registration = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      typeId: formType,
      number: formNumber,
      issueDate: formIssue,
      expiryDate: formExpiry,
      notes: formNotes,
      addedAt: Date.now(),
    };
    const updated = [...myRegs, reg];
    setMyRegs(updated);
    saveToStorage(updated);
    setFormType(""); setFormNumber(""); setFormIssue(""); setFormExpiry(""); setFormNotes("");
    setShowAddModal(false);
  }

  function deleteReg(id: string) {
    const updated = myRegs.filter((r) => r.id !== id);
    setMyRegs(updated);
    saveToStorage(updated);
  }

  const alerts = myRegs.filter((r) => {
    const days = getDaysUntilExpiry(r.expiryDate);
    return days !== null && days <= 30;
  });

  const byCategory = Object.entries(CAT_LABELS).map(([cat, label]) => ({
    cat,
    label,
    types: REG_TYPES.filter((t) => t.category === cat),
  }));

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="h-5 w-5 text-saffron-500" />
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Registration & License Tracker
              </h1>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Track all your export registrations — IEC, RCMC, GST LUT, FSSAI, and more. Get alerts before they expire.
            </p>
          </div>
          {activeTab === "tracker" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 shrink-0 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Registration
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "tracker", label: "My Registrations" },
            { id: "guide", label: "Registration Guide" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as "tracker" | "guide")}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                activeTab === t.id
                  ? "bg-saffron-500 border-saffron-500 text-white"
                  : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tracker tab ───────────────────────────────────── */}
        {activeTab === "tracker" && (
          <div className="flex flex-col gap-5">
            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                    {alerts.length} registration{alerts.length > 1 ? "s" : ""} expiring soon
                  </p>
                </div>
                <ul className="flex flex-col gap-1">
                  {alerts.map((r) => {
                    const type = REG_TYPES.find((t) => t.id === r.typeId);
                    const days = getDaysUntilExpiry(r.expiryDate)!;
                    return (
                      <li key={r.id} className="text-xs text-amber-700 dark:text-amber-400">
                        • {type?.name ?? r.typeId} ({r.number}) — {days <= 0 ? "EXPIRED" : `expires in ${days} days`}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {myRegs.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 flex flex-col items-center justify-center text-center">
                <ClipboardList className="h-12 w-12 text-zinc-200 dark:text-zinc-700 mb-3" />
                <p className="text-sm font-medium text-zinc-500">No registrations tracked yet.</p>
                <p className="text-xs text-zinc-400 mt-1">Add your IEC, GST LUT, RCMC, and other licenses to track expiry.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white px-5 py-2.5 text-sm font-semibold transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add your first registration
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myRegs.map((reg) => {
                  const type = REG_TYPES.find((t) => t.id === reg.typeId);
                  const days = getDaysUntilExpiry(reg.expiryDate);
                  const hasExpiry = Boolean(reg.expiryDate);

                  return (
                    <div
                      key={reg.id}
                      className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 flex items-start justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{type?.name ?? reg.typeId}</p>
                          <span className="text-xs text-zinc-400 font-mono">{reg.number}</span>
                          <StatusBadge days={days} hasExpiry={hasExpiry} />
                        </div>
                        <p className="text-xs text-zinc-400 mb-1">{type?.fullName}</p>
                        <div className="flex gap-4 text-xs text-zinc-500">
                          {reg.issueDate && <span>Issued: {reg.issueDate}</span>}
                          {reg.expiryDate && <span>Expires: {reg.expiryDate}</span>}
                        </div>
                        {reg.notes && <p className="text-xs text-zinc-400 mt-1.5 italic">{reg.notes}</p>}
                      </div>
                      <button
                        onClick={() => deleteReg(reg.id)}
                        className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Guide tab ──────────────────────────────────────── */}
        {activeTab === "guide" && (
          <div className="flex flex-col gap-6">
            {byCategory.map(({ cat, label, types }) => (
              <div key={cat}>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">{label}</p>
                <div className="flex flex-col gap-3">
                  {types.map((reg) => {
                    const isExpanded = expandedGuide === reg.id;
                    const requiredColor = reg.required === "mandatory"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : reg.required === "conditional"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-300";

                    return (
                      <div
                        key={reg.id}
                        className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedGuide(isExpanded ? null : reg.id)}
                          className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-saffron-100 dark:bg-saffron-900/30">
                            <span className="text-xs font-bold text-saffron-700 dark:text-saffron-400">{reg.name.slice(0, 3)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{reg.name}</p>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${requiredColor}`}>
                                {reg.required}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5 truncate">{reg.fullName} · {reg.authority}</p>
                          </div>
                          <div className="text-right shrink-0 hidden sm:block">
                            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{reg.validity.split(" (")[0]}</p>
                            <p className="text-xs text-zinc-400">{reg.cost}</p>
                          </div>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />}
                        </button>

                        {isExpanded && (
                          <div className="border-t border-zinc-100 dark:border-zinc-800 px-5 pb-5 pt-4 flex flex-col gap-4">
                            <div className="grid sm:grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">Validity</p>
                                <p className="font-medium text-zinc-800 dark:text-zinc-100 text-xs">{reg.validity}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">Cost</p>
                                <p className="font-medium text-zinc-800 dark:text-zinc-100 text-xs">{reg.cost}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">Authority</p>
                                <p className="font-medium text-zinc-800 dark:text-zinc-100 text-xs">{reg.authority}</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">How to apply</p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{reg.how}</p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">Documents required</p>
                              <ul className="flex flex-col gap-1">
                                {reg.docs.map((doc) => (
                                  <li key={doc} className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-saffron-400 shrink-0" />
                                    {doc}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex items-center gap-3">
                              <a
                                href={reg.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-medium text-saffron-600 hover:text-saffron-700 dark:text-saffron-400"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Apply at {reg.authority}
                              </a>
                              <button
                                onClick={() => { setFormType(reg.id); setShowAddModal(true); setActiveTab("tracker"); }}
                                className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Track this registration
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add modal ──────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Add Registration</h2>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Registration type *</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm text-zinc-900 dark:text-zinc-50 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400"
              >
                <option value="">Select type…</option>
                {REG_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} — {t.fullName}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Registration number *</label>
              <input
                type="text"
                value={formNumber}
                onChange={(e) => setFormNumber(e.target.value)}
                placeholder="e.g. AABCX1234MXM001"
                className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Issue date</label>
                <input type="date" value={formIssue} onChange={(e) => setFormIssue(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm text-zinc-900 dark:text-zinc-50 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Expiry date</label>
                <input type="date" value={formExpiry} onChange={(e) => setFormExpiry(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm text-zinc-900 dark:text-zinc-50 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Notes (optional)</label>
              <input type="text" value={formNotes} onChange={(e) => setFormNotes(e.target.value)}
                placeholder="e.g. Renewal pending, contact CA"
                className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400" />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button onClick={addReg} disabled={!formType || !formNumber}
                className="flex-1 rounded-xl bg-saffron-500 hover:bg-saffron-600 disabled:opacity-50 text-white px-4 py-2.5 text-sm font-semibold transition-colors">
                Save Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
