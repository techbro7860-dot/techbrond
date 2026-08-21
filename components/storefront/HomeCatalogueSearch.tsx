"use client";

import { useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";

const INDUSTRIES = [
  ["fintech", "FinTech"],
  ["edtech", "Education"],
  ["healthcare", "Healthcare"],
  ["e-commerce", "Retail & E-commerce"],
  ["real-estate", "Real Estate"],
  ["food-restaurant", "Food & Restaurant"],
  ["hr-recruitment", "HR & Recruitment"],
] as const;

const DEFAULT_POPULAR_SEARCHES = [
  "Clinic management",
  "Delivery app",
  "School ERP",
  "Real estate CRM",
  "AI chatbot",
] as const;

export function HomeCatalogueSearch({ popularSearches = DEFAULT_POPULAR_SEARCHES }: { popularSearches?: readonly string[] }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function resetFilters() {
    const form = formRef.current;
    if (!form) return;
    for (const name of ["industry", "platform", "min", "max", "sort"]) {
      const field = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
      if (field) field.value = name === "sort" ? "newest" : "";
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
    <form ref={formRef} action="/shop" method="get" className="relative">
      <div className="flex items-center gap-1.5 rounded-2xl border border-rule bg-white p-1.5 shadow-[0_16px_45px_rgba(8,26,58,0.14)] sm:gap-2 sm:p-2">
        <input name="q" type="search" placeholder="Search websites, apps or business software" aria-label="Search products" className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint sm:px-4 sm:text-base" />
        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Refine search" title="Refine search" className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${open ? "border-accent bg-accent-mist text-accent-deep" : "border-rule bg-white text-ink-soft hover:border-accent hover:text-accent-deep"}`}>
          <SlidersHorizontal size={18} aria-hidden="true" />
        </button>
        <button type="submit" aria-label="Search products" title="Search products" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-deep text-white shadow-accent transition hover:bg-[#071a3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"><Search size={19} aria-hidden="true" /></button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 rounded-2xl border border-rule bg-white p-4 text-left shadow-[0_22px_60px_rgba(31,38,78,0.18)] sm:p-5">
          <div className="flex items-center justify-between border-b border-rule-soft pb-3">
            <div><p className="text-sm font-bold text-ink">Refine your search</p><p className="mt-0.5 text-xs text-ink-faint">Choose only what matters to you.</p></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-paper-alt"><X size={18} /></button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block"><span className="label-muted">Industry</span><select name="industry" className="field mt-1.5"><option value="">All industries</option>{INDUSTRIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="block"><span className="label-muted">Platform</span><select name="platform" className="field mt-1.5"><option value="">Any platform</option><option value="web">Web</option><option value="android">Android</option><option value="ios">iOS</option><option value="web_app">Web + App</option></select></label>
            <label className="block"><span className="label-muted">Minimum price</span><input name="min" type="number" min="0" placeholder="₹0" className="field mt-1.5" /></label>
            <label className="block"><span className="label-muted">Maximum price</span><input name="max" type="number" min="0" placeholder="Any price" className="field mt-1.5" /></label>
          </div>
          <input type="hidden" name="sort" value="newest" />
          <div className="mt-5 flex items-center justify-end gap-3 border-t border-rule-soft pt-4"><button type="button" onClick={resetFilters} className="btn-quiet">Clear filters</button><button type="submit" className="btn-primary rounded-xl px-6">View matching products</button></div>
        </div>
      )}
    </form>

      <nav
        className="mx-auto mt-3 flex flex-wrap items-center justify-center gap-2 px-1 pb-1 sm:mt-4"
        aria-label="Popular product searches"
      >
        <span className="shrink-0 pr-1 font-sans text-xs font-semibold text-accent-deep sm:text-sm">
          Popular
        </span>
        {popularSearches.map((term) => (
          <Link
            key={term}
            href={`/shop?q=${encodeURIComponent(term)}`}
            className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-ink-soft shadow-sm ring-1 ring-rule transition hover:-translate-y-0.5 hover:bg-accent-mist hover:text-accent-deep hover:ring-blue-300 sm:px-4 sm:py-2 sm:text-xs"
          >
            {term}
          </Link>
        ))}
      </nav>
    </div>
  );
}
