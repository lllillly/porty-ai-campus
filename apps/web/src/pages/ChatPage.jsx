import React, { useState, useRef, useEffect } from "react";
import { Coffee, Loader, Search, Send, Settings } from "react-feather";
import { sendChatMessage } from "../api/chatApi";

import ChatBubble from "../components/ChatBubble";
import ChatMessage from "../components/ChatMessage";
import DietCard from "../components/DietCard";
import DietSettingsModal from "../components/DietSettingsModal";
import CalendarCard from "../components/CalendarCard";
import CampusMap from "../components/CampusMap";
import CourseRegist from "../components/CourseRegist";
import FAQPreview from "../components/FAQPreview";

import Toast from "../components/Toast";
import SettingsModal from "../components/SettingsModal";
import SplashScreen from "../components/SplashScreen";
import { isImeKeyEvent } from "../utils/chatInput";
import { isAcademicCalendarQuery } from "../utils/queryIntents";
import {
  clearChatSession,
  getInitialChats,
  getOrCreateSessionId,
  saveChats,
} from "../utils/chatSession";

import {
  ChatContainer,
  Header,
  HeaderContent,
  BrandButton,
  Logo,
  BrandCopy,
  BrandName,
  BrandStatus,
  HeaderActions,
  MenuButton,
  NotificationButton,
  ChatBody,
  InputArea,
  InputWrapper,
  InputIcon,
  StyledInput,
  SendButton,
} from "../styles/ChatPage.styles";

const INPUT_COMPOSITION_SETTLE_MS = 24;

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const [sessionId] = useState(getOrCreateSessionId);
  const [chats, setChats] = useState(getInitialChats);

  const [loading, setLoading] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  const [dietSettings, setDietSettings] = useState(null);
  const [showDietModal, setShowDietModal] = useState(false);

  const [showDarkModal, setShowDarkModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("porty_dark_mode") === "true",
  );

  const [showSplash, setShowSplash] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  const chatBodyRef = useRef(null);
  const inputRef = useRef(null);
  const lastChatRef = useRef(null);
  const chatsRef = useRef(chats);
  const imeSubmitPendingRef = useRef(false);
  const submitTimerRef = useRef(null);
  const toastTimerRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(
      () => setToastMessage(""),
      1800,
    );
  };

  useEffect(() => {
    return () => {
      window.clearTimeout(submitTimerRef.current);
      window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    chatsRef.current = chats;
    saveChats(chats);
  }, [chats]);

  useEffect(() => {
    const saved = localStorage.getItem("diet_settings");
    if (saved) {
      const d = JSON.parse(saved);
      if (d.campus && d.place) {
        setDietSettings(d);
      }
    }
  }, []);

  useEffect(() => {
    const body = chatBodyRef.current;
    const latest = lastChatRef.current;
    if (!body || !latest) return;

    const bodyTop = body.getBoundingClientRect().top;
    const latestTop = latest.getBoundingClientRect().top;
    body.scrollTo({
      top:
        chats.length <= 1
          ? 0
          : Math.max(0, body.scrollTop + latestTop - bodyTop - 12),
      behavior: "smooth",
    });
  }, [chats]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? "#141A17" : "#F7FBF8";
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
    return () => {
      document.body.style.backgroundColor = "";
      delete document.documentElement.dataset.theme;
    };
  }, [isDarkMode]);

  const appendChat = (msg) => setChats((prev) => [...prev, msg]);

  const submitInput = () => {
    sendMessage(inputRef.current?.value || "");
  };

  const scheduleInputSubmit = () => {
    window.clearTimeout(submitTimerRef.current);
    submitTimerRef.current = window.setTimeout(
      submitInput,
      INPUT_COMPOSITION_SETTLE_MS,
    );
  };

  const sendMessage = async (rawText = message) => {
    if (loading) return;

    const text = rawText.trim();
    if (!text) return;

    setMessage("");
    setLoading(true);
    setShowFAQ(false);

    appendChat({ sender: "user", text });

    if (isAcademicCalendarQuery(text)) {
      appendChat({
        sender: "porty",
        component: <CalendarCard onBackToMain={handleBackToMain} />,
      });
      setLoading(false);
      return;
    }

    if (text === "찾아오시는 길") {
      appendChat({
        sender: "porty",
        component: <CampusMap onBackToMain={handleBackToMain} />,
      });
      setLoading(false);
      return;
    }

    if (text === "수강신청") {
      appendChat({
        sender: "porty",
        component: <CourseRegist onBackToMain={handleBackToMain} />,
      });
      setLoading(false);
      return;
    }

    if (text === "식단표 보기" && dietSettings) {
      appendChat({
        sender: "porty",
        component: (
          <DietCard
            campus={dietSettings.campus}
            place={dietSettings.place}
            dorm={dietSettings.dorm}
            onBackToMain={handleBackToMain}
          />
        ),
      });
      setLoading(false);
      return;
    }

    try {
      const history = chatsRef.current
        .filter((chat) => chat.text && !chat.showQuickActions)
        .map((chat) => ({
          role: chat.sender === "user" ? "user" : "assistant",
          content: chat.text,
        }))
        .slice(-12);
      const response = await sendChatMessage({
        sessionId,
        message: text,
        history,
      });

      const responseText =
        response?.response || "응답을 가져올 수 없습니다.";
      appendChat({
        sender: "porty",
        text: responseText,
        presentation: response?.presentation || null,
      });
    } catch {
      appendChat({
        sender: "porty",
        text: "서버 연결 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMain = () =>
    appendChat({
      sender: "porty",
      text: "다른 도움이 필요하시면 아래 버튼을 선택해 주세요.",
      showQuickActions: true,
    });

  const resetConversation = () => {
    clearChatSession();
    window.location.reload();
  };

  const handleDietModalSave = (s) => {
    setDietSettings(s);
    setShowDietModal(false);
    showToast("식단 설정이 저장되었습니다!");
  };

  const handleDietModalDelete = () => {
    setDietSettings(null);
    setShowDietModal(false);
    showToast("식단 설정이 삭제되었습니다.");
  };

  return (
    <ChatContainer $isDark={isDarkMode}>
      {showSplash && <SplashScreen />}

      <Header $isDark={isDarkMode}>
        <HeaderContent>
          <BrandButton
            onClick={resetConversation}
            title="포티와 새 대화 시작하기"
            aria-label="포티와 새 대화 시작하기"
          >
            <Logo src="/assets/knung-icon.png" alt="" />
            <BrandCopy>
              <BrandName $isDark={isDarkMode}>공주대 챗봇</BrandName>
              <BrandStatus $isDark={isDarkMode}>
                국립공주대학교 학생생활 안내
              </BrandStatus>
            </BrandCopy>
          </BrandButton>

          <HeaderActions>
            <NotificationButton
              $isDark={isDarkMode}
              onClick={() => setShowDietModal(true)}
              title="식단 설정"
              aria-label="식단 설정 열기"
            >
              <Coffee size={18} />
            </NotificationButton>

            <MenuButton
              $isDark={isDarkMode}
              onClick={() => setShowDarkModal(true)}
              title="포티 설정"
              aria-label="포티 설정 열기"
            >
              <Settings size={18} />
            </MenuButton>
          </HeaderActions>
        </HeaderContent>
      </Header>

      {toastMessage && <Toast message={toastMessage} />}

      {showFAQ && (
        <FAQPreview
          searchTerm={message}
          onSelect={(question) => {
            setShowFAQ(false);
            sendMessage(question);
          }}
          onClose={() => setShowFAQ(false)}
        />
      )}

      <ChatBody
        ref={chatBodyRef}
        $isDark={isDarkMode}
        $isWelcome={chats.length === 1 && chats[0].showWelcome}
      >
        {chats.map((c, idx) => (
          <div key={idx} ref={idx === chats.length - 1 ? lastChatRef : null}>
            <ChatMessage
              chat={c}
              isDark={isDarkMode}
              hasDietSettings={Boolean(dietSettings)}
              onActionClick={sendMessage}
              onDietSetup={() => setShowDietModal(true)}
              onBackToMain={handleBackToMain}
            />
          </div>
        ))}

        {loading && (
          <ChatBubble
            message="답변을 작성하고 있습니다..."
            isUser={false}
            isDark={isDarkMode}
          />
        )}
      </ChatBody>

      <InputArea $isDark={isDarkMode}>
        <InputWrapper $isDark={isDarkMode}>
          <InputIcon aria-hidden="true">
            <Search size={18} />
          </InputIcon>
          <StyledInput
            ref={inputRef}
            $isDark={isDarkMode}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setShowFAQ(true)}
            onCompositionStart={() => {
              imeSubmitPendingRef.current = false;
            }}
            onCompositionEnd={() => {
              if (!imeSubmitPendingRef.current) return;
              imeSubmitPendingRef.current = false;
              scheduleInputSubmit();
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setShowFAQ(false);
                return;
              }
              if (e.key !== "Enter") return;

              e.preventDefault();
              if (isImeKeyEvent(e.nativeEvent)) {
                imeSubmitPendingRef.current = true;
                return;
              }
              submitInput();
            }}
            placeholder="궁금한 학교생활을 물어보세요"
            aria-expanded={showFAQ}
            aria-controls="porty-question-preview"
          />

          <SendButton
            $loading={loading}
            disabled={loading || !message.trim()}
            onClick={submitInput}
            aria-label={loading ? "답변 작성 중" : "메시지 보내기"}
          >
            {loading ? <Loader size={20} /> : <Send size={20} />}
          </SendButton>
        </InputWrapper>
      </InputArea>

      {showDietModal && (
        <DietSettingsModal
          onClose={() => setShowDietModal(false)}
          onSave={handleDietModalSave}
          onDelete={handleDietModalDelete}
        />
      )}

      {showDarkModal && (
        <SettingsModal
          isDarkMode={isDarkMode}
          onToggleDarkMode={() =>
            setIsDarkMode((prev) => {
              const next = !prev;
              localStorage.setItem("porty_dark_mode", next);
              return next;
            })
          }
          onClose={() => setShowDarkModal(false)}
        />
      )}
    </ChatContainer>
  );
};

export default ChatPage;
