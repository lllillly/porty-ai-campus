const aiApiUrl = import.meta.env.VITE_AI_API_URL || "";

async function persistExchange({ sessionId, message, response, sources }) {
  const { isSupabaseConfigured, supabase } = await import("../lib/supabase");

  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error: sessionError } = await supabase.from("chat_sessions").upsert(
    {
      id: sessionId,
      user_id: user.id,
      title: message.slice(0, 80),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (sessionError) {
    throw sessionError;
  }

  const { error: messageError } = await supabase.from("chat_messages").insert([
    {
      session_id: sessionId,
      user_id: user.id,
      role: "user",
      content: message,
    },
    {
      session_id: sessionId,
      user_id: user.id,
      role: "assistant",
      content: response,
      sources,
    },
  ]);

  if (messageError) {
    throw messageError;
  }
}

export async function sendChatMessage({ sessionId, message }) {
  const request = await fetch(`${aiApiUrl}/api/ai/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId,
      messages: [{ role: "user", content: message }],
    }),
  });

  if (!request.ok) {
    throw new Error(`AI server returned ${request.status}`);
  }

  const payload = await request.json();

  try {
    await persistExchange({
      sessionId,
      message,
      response: payload.response,
      sources: payload.sources || [],
    });
  } catch (error) {
    // 채팅 응답은 유지하고 저장 실패만 개발자 도구에 표시합니다.
    console.warn("Failed to persist chat exchange", error);
  }

  return payload;
}
