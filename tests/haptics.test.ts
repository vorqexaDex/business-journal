import { afterEach, describe, expect, it, vi } from "vitest";
import { haptic, setHapticsEnabled } from "@/core/haptics";

function stubBrowser(options: { reduced?: boolean; stored?: string | null } = {}) {
  const vibrate = vi.fn();
  const setItem = vi.fn();
  vi.stubGlobal("navigator", { vibrate });
  vi.stubGlobal("window", {
    matchMedia: () => ({ matches: options.reduced ?? false }),
    localStorage: { getItem: () => options.stored ?? null, setItem },
  });
  return { vibrate, setItem };
}

afterEach(() => vi.unstubAllGlobals());

describe("haptics", () => {
  it("gives a short pulse for a tap", () => {
    const { vibrate } = stubBrowser();
    haptic("tap");
    expect(vibrate).toHaveBeenCalledWith(8);
  });

  it("uses a stronger pattern for errors", () => {
    const { vibrate } = stubBrowser();
    haptic("error");
    expect(vibrate).toHaveBeenCalledWith(expect.any(Array));
  });

  it("stays silent when the user prefers reduced motion", () => {
    const { vibrate } = stubBrowser({ reduced: true });
    haptic("tap");
    expect(vibrate).not.toHaveBeenCalled();
  });

  it("stays silent when the user switched haptics off", () => {
    const { vibrate } = stubBrowser({ stored: "off" });
    haptic("error");
    expect(vibrate).not.toHaveBeenCalled();
  });

  it("does nothing, without crashing, on devices that cannot vibrate", () => {
    vi.stubGlobal("navigator", {});
    vi.stubGlobal("window", {
      matchMedia: () => ({ matches: false }),
      localStorage: { getItem: () => null, setItem: vi.fn() },
    });
    expect(() => haptic("tap")).not.toThrow();
  });

  it("remembers the user's choice", () => {
    const { setItem } = stubBrowser();
    setHapticsEnabled(false);
    expect(setItem).toHaveBeenCalledWith("bj:haptics", "off");
  });
});
