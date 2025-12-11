"use client";

import { useEffect, useState } from "react";

type SiteSettings = {
  id: number;
  siteName: string;
  logoUrl: string | null;
  googleAnalyticsId: string | null;
  headerAdHtml: string | null;
  footerAdHtml: string | null;
};

export function SettingsPageClient() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) {
          throw new Error("Failed to load settings");
        }
        const data = (await res.json()) as SiteSettings;
        setSettings(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;

    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Failed to save settings");
      }

      const updated = (await res.json()) as SiteSettings;
      setSettings(updated);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-400">Loading settings4</p>;
  }

  if (!settings) {
    return (
      <p className="text-sm text-red-300">
        Failed to load settings. Please refresh the page.
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-400">
          Configure site identity, Google Analytics, and basic ads.
        </p>
      </header>

      {error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm"
      >
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-100">Site</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col">
              <label
                htmlFor="siteName"
                className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400"
              >
                Site name
              </label>
              <input
                id="siteName"
                value={settings.siteName}
                onChange={(event) =>
                  setSettings({ ...settings, siteName: event.target.value })
                }
                className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="logoUrl"
                className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400"
              >
                Logo URL
              </label>
              <input
                id="logoUrl"
                value={settings.logoUrl ?? ""}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    logoUrl: event.target.value || null,
                  })
                }
                className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-100">
            Google Analytics
          </h2>
          <div className="flex flex-col md:max-w-md">
            <label
              htmlFor="gaId"
              className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Measurement ID
            </label>
            <input
              id="gaId"
              value={settings.googleAnalyticsId ?? ""}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  googleAnalyticsId: event.target.value || null,
                })
              }
              placeholder="G-XXXXXXXXXX"
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
            <p className="mt-1 text-xs text-zinc-500">
              When set, Google Analytics will be injected on all public pages.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-100">Header ad</h2>
          <p className="text-xs text-zinc-500">
            Paste HTML or script tags for a banner to appear below the main
            navigation on all public pages.
          </p>
          <textarea
            rows={4}
            value={settings.headerAdHtml ?? ""}
            onChange={(event) =>
              setSettings({
                ...settings,
                headerAdHtml: event.target.value || null,
              })
            }
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-100">Footer ad</h2>
          <p className="text-xs text-zinc-500">
            Paste HTML or script tags for a banner to appear above the footer on
            all public pages.
          </p>
          <textarea
            rows={4}
            value={settings.footerAdHtml ?? ""}
            onChange={(event) =>
              setSettings({
                ...settings,
                footerAdHtml: event.target.value || null,
              })
            }
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
          />
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-50 px-4 text-xs font-semibold uppercase tracking-wide text-zinc-950 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving4" : "Save changes"}
          </button>
          <p className="text-xs text-zinc-500">
            Changes apply immediately to the public site.
          </p>
        </div>
      </form>
    </div>
  );
}
