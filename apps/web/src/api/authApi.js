async function getClient() {
  return import("../lib/supabase");
}

export async function getAuthUser() {
  const { isSupabaseConfigured, supabase } = await getClient();
  if (!isSupabaseConfigured || !supabase) {
    return { configured: false, user: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { configured: true, user };
}

export async function sendMagicLink(email) {
  const { isSupabaseConfigured, supabase } = await getClient();
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) {
    throw error;
  }
}

export async function signOut() {
  const { supabase } = await getClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
}
