import { describe, it, expect } from "vitest";
import { localizedPath } from "@/hooks/useLocale";

describe("localizedPath", () => {
  it("prefixes locale to path", () => {
    expect(localizedPath("en", "menu")).toBe("/en/menu");
    expect(localizedPath("ar", "/cart")).toBe("/ar/cart");
  });

  it("handles root path", () => {
    expect(localizedPath("en", "")).toBe("/en");
    expect(localizedPath("en", "/")).toBe("/en");
  });
});
