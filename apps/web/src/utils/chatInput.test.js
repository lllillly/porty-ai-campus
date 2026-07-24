import { describe, expect, it } from "vitest";

import { isImeKeyEvent } from "./chatInput";

describe("isImeKeyEvent", () => {
  it("detects an active Korean IME composition", () => {
    expect(isImeKeyEvent({ isComposing: true, keyCode: 13 })).toBe(true);
    expect(isImeKeyEvent({ isComposing: false, keyCode: 229 })).toBe(true);
  });

  it("allows a regular Enter key to submit", () => {
    expect(isImeKeyEvent({ isComposing: false, keyCode: 13 })).toBe(false);
  });
});
