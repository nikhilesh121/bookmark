"use client";

import { useEffect, useState } from "react";

type SiteSettings = {
  id: number;
  siteName: string;
  logoUrl: string | null;
  googleAnalyticsId: string | null;
  headerAdHtml: string | null;
  footerAdHtml: string | null;
  bannerTitle: string | null;
  bannerSubtitle: string | null;
  bannerDescription: string | null;
  bannerBgColor: string | null;
  bannerBgImage: string | null;
  bannerTextColor: string | null;
  bannerBtn1Text: string | null;
  bannerBtn1Link: string | null;
  bannerBtn1Color: string | null;
  bannerBtn2Text: string | null;
  bannerBtn2Link: string | null;
  bannerBtn2Color: string | null;
  headerBgColor: string | null;
  headerTextColor: string | null;
  footerBgColor: string | null;
  footerTextColor: string | null;
  footerDescription: string | null;
};

export function SettingsPageClient() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "banner" | "header" | "footer">("general");

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
    return <p className="text-sm text-zinc-400">Loading settings...</p>;
  }

  if (!settings) {
    return (
      <p className="text-sm text-red-300">
        Failed to load settings. Please refresh the page.
      </p>
    );
  }

  const tabs = [
    { id: "general" as const, label: "General" },
    { id: "banner" as const, label: "Hero Banner" },
    { id: "header" as const, label: "Header" },
    { id: "footer" as const, label: "Footer" },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-400">
          Customize your site appearance, header, footer, and banner.
        </p>
      </header>

      {error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="flex gap-1 border-b border-zinc-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-indigo-500 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm"
      >
        {activeTab === "general" && (
          <>
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-zinc-100">Site Identity</h2>
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
          </>
        )}

        {activeTab === "banner" && (
          <>
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-zinc-100">Hero Banner Content</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col">
                  <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Title
                  </label>
                  <input
                    value={settings.bannerTitle ?? ""}
                    onChange={(e) =>
                      setSettings({ ...settings, bannerTitle: e.target.value || null })
                    }
                    placeholder="Discover Your Next"
                    className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Subtitle (highlighted)
                  </label>
                  <input
                    value={settings.bannerSubtitle ?? ""}
                    onChange={(e) =>
                      setSettings({ ...settings, bannerSubtitle: e.target.value || null })
                    }
                    placeholder="Favorite Story"
                    className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={settings.bannerDescription ?? ""}
                  onChange={(e) =>
                    setSettings({ ...settings, bannerDescription: e.target.value || null })
                  }
                  placeholder="Browse our curated collection of manga, anime, and movies."
                  className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-zinc-100">Banner Design</h2>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex flex-col">
                  <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.bannerBgColor ?? "#6366f1"}
                      onChange={(e) =>
                        setSettings({ ...settings, bannerBgColor: e.target.value })
                      }
                      className="h-9 w-12 rounded border border-zinc-700 bg-zinc-950 cursor-pointer"
                    />
                    <input
                      value={settings.bannerBgColor ?? ""}
                      onChange={(e) =>
                        setSettings({ ...settings, bannerBgColor: e.target.value || null })
                      }
                      placeholder="#6366f1"
                      className="flex-1 h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Text Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.bannerTextColor ?? "#ffffff"}
                      onChange={(e) =>
                        setSettings({ ...settings, bannerTextColor: e.target.value })
                      }
                      className="h-9 w-12 rounded border border-zinc-700 bg-zinc-950 cursor-pointer"
                    />
                    <input
                      value={settings.bannerTextColor ?? ""}
                      onChange={(e) =>
                        setSettings({ ...settings, bannerTextColor: e.target.value || null })
                      }
                      placeholder="#ffffff"
                      className="flex-1 h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>
                </div>
                <div className="flex flex-col md:col-span-1">
                  <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Background Image URL
                  </label>
                  <input
                    value={settings.bannerBgImage ?? ""}
                    onChange={(e) =>
                      setSettings({ ...settings, bannerBgImage: e.target.value || null })
                    }
                    placeholder="https://example.com/banner.jpg"
                    className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    If set, image will overlay the background color.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-zinc-100">Banner Buttons</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 p-3 border border-zinc-700 rounded-lg">
                  <h3 className="text-xs font-semibold text-zinc-300">Primary Button</h3>
                  <div className="grid gap-2">
                    <input
                      value={settings.bannerBtn1Text ?? ""}
                      onChange={(e) =>
                        setSettings({ ...settings, bannerBtn1Text: e.target.value || null })
                      }
                      placeholder="Browse Manga"
                      className="h-8 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400"
                    />
                    <input
                      value={settings.bannerBtn1Link ?? ""}
                      onChange={(e) =>
                        setSettings({ ...settings, bannerBtn1Link: e.target.value || null })
                      }
                      placeholder="/manga"
                      className="h-8 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400"
                    />
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.bannerBtn1Color ?? "#fde047"}
                        onChange={(e) =>
                          setSettings({ ...settings, bannerBtn1Color: e.target.value })
                        }
                        className="h-8 w-10 rounded border border-zinc-700 bg-zinc-950 cursor-pointer"
                      />
                      <input
                        value={settings.bannerBtn1Color ?? ""}
                        onChange={(e) =>
                          setSettings({ ...settings, bannerBtn1Color: e.target.value || null })
                        }
                        placeholder="#fde047"
                        className="flex-1 h-8 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2 p-3 border border-zinc-700 rounded-lg">
                  <h3 className="text-xs font-semibold text-zinc-300">Secondary Button</h3>
                  <div className="grid gap-2">
                    <input
                      value={settings.bannerBtn2Text ?? ""}
                      onChange={(e) =>
                        setSettings({ ...settings, bannerBtn2Text: e.target.value || null })
                      }
                      placeholder="Watch Anime"
                      className="h-8 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400"
                    />
                    <input
                      value={settings.bannerBtn2Link ?? ""}
                      onChange={(e) =>
                        setSettings({ ...settings, bannerBtn2Link: e.target.value || null })
                      }
                      placeholder="/anime"
                      className="h-8 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400"
                    />
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.bannerBtn2Color ?? "#ffffff33"}
                        onChange={(e) =>
                          setSettings({ ...settings, bannerBtn2Color: e.target.value })
                        }
                        className="h-8 w-10 rounded border border-zinc-700 bg-zinc-950 cursor-pointer"
                      />
                      <input
                        value={settings.bannerBtn2Color ?? ""}
                        onChange={(e) =>
                          setSettings({ ...settings, bannerBtn2Color: e.target.value || null })
                        }
                        placeholder="rgba(255,255,255,0.2)"
                        className="flex-1 h-8 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === "header" && (
          <>
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-zinc-100">Header Design</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col">
                  <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.headerBgColor ?? "#18181b"}
                      onChange={(e) =>
                        setSettings({ ...settings, headerBgColor: e.target.value })
                      }
                      className="h-9 w-12 rounded border border-zinc-700 bg-zinc-950 cursor-pointer"
                    />
                    <input
                      value={settings.headerBgColor ?? ""}
                      onChange={(e) =>
                        setSettings({ ...settings, headerBgColor: e.target.value || null })
                      }
                      placeholder="#18181b"
                      className="flex-1 h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Text Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.headerTextColor ?? "#ffffff"}
                      onChange={(e) =>
                        setSettings({ ...settings, headerTextColor: e.target.value })
                      }
                      className="h-9 w-12 rounded border border-zinc-700 bg-zinc-950 cursor-pointer"
                    />
                    <input
                      value={settings.headerTextColor ?? ""}
                      onChange={(e) =>
                        setSettings({ ...settings, headerTextColor: e.target.value || null })
                      }
                      placeholder="#ffffff"
                      className="flex-1 h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-zinc-100">Header Ad HTML</h2>
              <p className="text-xs text-zinc-500">
                Paste HTML or script tags for a banner to appear below the main
                navigation on all public pages.
              </p>
              <textarea
                rows={6}
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
          </>
        )}

        {activeTab === "footer" && (
          <>
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-zinc-100">Footer Design</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col">
                  <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.footerBgColor ?? "#18181b"}
                      onChange={(e) =>
                        setSettings({ ...settings, footerBgColor: e.target.value })
                      }
                      className="h-9 w-12 rounded border border-zinc-700 bg-zinc-950 cursor-pointer"
                    />
                    <input
                      value={settings.footerBgColor ?? ""}
                      onChange={(e) =>
                        setSettings({ ...settings, footerBgColor: e.target.value || null })
                      }
                      placeholder="#18181b"
                      className="flex-1 h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Text Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.footerTextColor ?? "#a1a1aa"}
                      onChange={(e) =>
                        setSettings({ ...settings, footerTextColor: e.target.value })
                      }
                      className="h-9 w-12 rounded border border-zinc-700 bg-zinc-950 cursor-pointer"
                    />
                    <input
                      value={settings.footerTextColor ?? ""}
                      onChange={(e) =>
                        setSettings({ ...settings, footerTextColor: e.target.value || null })
                      }
                      placeholder="#a1a1aa"
                      className="flex-1 h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-zinc-100">Footer Content</h2>
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Footer Description
                </label>
                <textarea
                  rows={3}
                  value={settings.footerDescription ?? ""}
                  onChange={(e) =>
                    setSettings({ ...settings, footerDescription: e.target.value || null })
                  }
                  placeholder="Your ultimate destination for discovering the best manga, anime, and movies."
                  className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-zinc-100">Footer Ad HTML</h2>
              <p className="text-xs text-zinc-500">
                Paste HTML or script tags for a banner to appear above the footer on
                all public pages.
              </p>
              <textarea
                rows={6}
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
          </>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-zinc-700">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 text-xs font-semibold uppercase tracking-wide text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <p className="text-xs text-zinc-500">
            Changes apply immediately to the public site.
          </p>
        </div>
      </form>
    </div>
  );
}
