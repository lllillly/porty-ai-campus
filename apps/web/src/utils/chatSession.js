const CHAT_MEMORY_KEY = "porty_session_chats_v3";
const CHAT_SESSION_KEY = "chat_session_id";

export const INITIAL_CHATS = [
  {
    sender: "porty",
    showWelcome: true,
  },
];

export const getOrCreateSessionId = () => {
  const savedSessionId = sessionStorage.getItem(CHAT_SESSION_KEY);
  if (savedSessionId) {
    return savedSessionId;
  }

  const sessionId = crypto.randomUUID();
  sessionStorage.setItem(CHAT_SESSION_KEY, sessionId);
  return sessionId;
};

export const getInitialChats = () => {
  try {
    const savedChats = JSON.parse(sessionStorage.getItem(CHAT_MEMORY_KEY));
    return Array.isArray(savedChats) && savedChats.length > 0
      ? savedChats
      : INITIAL_CHATS;
  } catch {
    return INITIAL_CHATS;
  }
};

export const saveChats = (chats) => {
  const serializableChats = chats
    .filter((chat) => chat.text)
    .slice(-24)
    .map(({ sender, text, showQuickActions, presentation }) => ({
      sender,
      text,
      showQuickActions: Boolean(showQuickActions),
      presentation: presentation || null,
    }));

  sessionStorage.setItem(CHAT_MEMORY_KEY, JSON.stringify(serializableChats));
};

export const clearChatSession = () => {
  sessionStorage.removeItem(CHAT_MEMORY_KEY);
  sessionStorage.removeItem(CHAT_SESSION_KEY);
};
