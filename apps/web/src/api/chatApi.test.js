import { afterEach, describe, expect, it, vi } from "vitest";

import { sendChatMessage } from "./chatApi";


describe("sendChatMessage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the AI response in demo mode", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          response: "천안캠퍼스는 천안시 서북구에 있습니다.",
          sources: [],
          mode: "retrieval",
        }),
      }),
    );

    const result = await sendChatMessage({
      sessionId: "a0f387d2-eb0c-4528-924d-25f8a1444fae",
      message: "천안캠퍼스 위치 알려줘",
    });

    expect(result.mode).toBe("retrieval");
    expect(result.response).toContain("천안캠퍼스");
  });

  it("throws when the AI server returns an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    );

    await expect(
      sendChatMessage({
        sessionId: "a0f387d2-eb0c-4528-924d-25f8a1444fae",
        message: "안녕",
      }),
    ).rejects.toThrow("503");
  });
});

