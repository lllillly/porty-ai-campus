const aiApiUrl = import.meta.env.VITE_AI_API_URL || "";

export async function getSystemHealth() {
  const aiRequest = await fetch(`${aiApiUrl}/api/ai/health`);
  const ai = aiRequest.ok ? await aiRequest.json() : null;

  let database = "NOT_CONFIGURED";
  const { isSupabaseConfigured, supabase } = await import("../lib/supabase");
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from("knowledge_documents")
      .select("id", { count: "exact", head: true });
    database = error ? "FAIL" : "OK";
  }

  return {
    web: "OK",
    ai: ai?.status === "ok" ? "OK" : "FAIL",
    database,
  };
}
