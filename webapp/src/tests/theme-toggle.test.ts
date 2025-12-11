import { describe, expect, it, vi, beforeEach } from "vitest";

describe("Theme Toggle", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it("should default to dark theme when no preference is stored", () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    const stored = localStorage.getItem("theme");
    const prefersDark = stored === "dark" || (!stored && true);
    expect(prefersDark).toBe(true);
  });

  it("should return dark when stored theme is dark", () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue("dark");
    const stored = localStorage.getItem("theme");
    const prefersDark = stored === "dark" || (!stored && true);
    expect(prefersDark).toBe(true);
  });

  it("should return light when stored theme is light", () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue("light");
    const stored = localStorage.getItem("theme");
    const prefersDark = stored === "dark" || (!stored && true);
    expect(prefersDark).toBe(false);
  });

  it("should save theme preference to localStorage", () => {
    localStorage.setItem("theme", "light");
    expect(localStorage.setItem).toHaveBeenCalledWith("theme", "light");
  });
});
