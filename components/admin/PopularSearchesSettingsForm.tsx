"use client";

import { FormEvent, useState } from "react";
import type { SiteSettingsData } from "@/lib/site-settings";

export function PopularSearchesSettingsForm({ initial }: { initial: SiteSettingsData }) {
  const [settings, setSettings] = useState(initial);
  const [value, setValue] = useState(initial.home.popularSearches.join("\n"));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const popularSearches = Array.from(
      new Set(value.split("\n").map((term) => term.trim()).filter(Boolean)),
    ).slice(0, 12);

    try {
      const currentResponse = await fetch("/api/settings", { cache: "no-store" });
      const currentData = (await currentResponse.json()) as { settings?: SiteSettingsData };
      const latest = currentData.settings ?? settings;
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...latest,
          home: { ...latest.home, popularSearches },
        }),
      });
      const data = (await response.json()) as { error?: string; settings?: SiteSettingsData };
      if (!response.ok) throw new Error(data.error || "Could not save popular searches.");

      if (data.settings) setSettings(data.settings);
      setValue(popularSearches.join("\n"));
      setMessage("Popular searches saved. The homepage is updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save popular searches.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="card mb-6 overflow-hidden">
      <div className="panel-head">
        <h2 className="text-sm font-semibold text-ink">Homepage popular searches</h2>
        <p className="mt-1 text-xs text-ink-faint">Enter one search phrase per line. Up to 12 links appear below the homepage search bar.</p>
      </div>
      <div className="p-5">
        <label htmlFor="popular-searches" className="text-xs font-bold text-ink">Search phrases</label>
        <textarea
          id="popular-searches"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={6}
          maxLength={900}
          className="field mt-2 resize-y"
          placeholder={"Clinic management\nDelivery app\nSchool ERP"}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className={`text-xs ${message.startsWith("Popular") ? "text-save" : "text-red-600"}`} role="status">{message}</p>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save popular searches"}
          </button>
        </div>
      </div>
    </form>
  );
}
