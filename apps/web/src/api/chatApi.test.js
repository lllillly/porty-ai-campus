import { afterEach, describe, expect, it, vi } from "vitest";

import { sendChatMessage } from "./chatApi";


describe("sendChatMessage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the server response", async () => {
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

  it("throws when the server returns an error", async () => {
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

  it("sends recent conversation context with a follow-up question", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: "공식 공지를 확인해 주세요.",
        sources: [],
        mode: "generated",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await sendChatMessage({
      sessionId: "a0f387d2-eb0c-4528-924d-25f8a1444fae",
      message: "그건 언제 해?",
      history: [
        { role: "user", content: "수강신청 방법 알려줘" },
        { role: "assistant", content: "수강신청 시스템에서 신청해요." },
      ],
    });

    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(requestBody.messages).toHaveLength(3);
    expect(requestBody.messages[0].content).toContain("수강신청");
  });
});
