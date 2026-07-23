import React, { useState, useRef, useEffect } from "react";
import { Bell, Loader, Menu, Send } from "react-feather";
import { sendChatMessage } from "../api/chatApi";

import ChatBubble from "../components/ChatBubble";
import QuickActions from "../components/QuickActions";
import DietCard from "../components/DietCard";
import DietSettingsModal from "../components/DietSettingsModal";
import CalendarCard from "../components/CalendarCard";
import CampusMap from "../components/CampusMap";
import CourseRegist from "../components/CourseRegist";
import FAQPreview from "../components/FAQPreview";

import Toast from "../components/Toast";
import FloatingMenu from "../components/FloatingMenu";
import SettingsModal from "../components/SettingsModal";
import SplashScreen from "../components/SplashScreen";

import {
  ChatContainer,
  Header,
  HeaderContent,
  Logo,
  MenuButton,
  NotificationButton,
  ChatBody,
  InputArea,
  InputWrapper,
  StyledInput,
  SendButton,
} from "../styles/ChatPage.styles";

const generateSessionId = () => {
  return crypto.randomUUID();
};

const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem("chat_session_id");
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem("chat_session_id", sessionId);
  }
  return sessionId;
};

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [chats, setChats] = useState([
    {
      sender: "porty",
      text: "안녕하세요 😊 공주대학교의 모든 것을 알려주는 챗봇 포티입니다.\n무엇을 도와드릴까요?",
      showQuickActions: true,
    },
  ]);

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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 1800);
  };

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

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
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chats]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? "#000" : "#FFF";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, [isDarkMode]);

  const appendChat = (msg) => setChats((prev) => [...prev, msg]);

  const sendMessage = async (rawText = message) => {
    if (loading) return;

    const text = rawText.trim();
    if (!text) return;

    setMessage("");
    setLoading(true);
    setShowFAQ(false);

    appendChat({ sender: "user", text });

    if (text === "학사 일정") {
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
      const response = await sendChatMessage({
        sessionId,
        message: text,
      });

      appendChat({
        sender: "porty",
        text: response?.response || "응답을 가져올 수 없습니다.",
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
      text: "다른 도움이 필요하시면 아래 버튼을 선택해주세요!",
      showQuickActions: true,
    });

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
          <Logo
            src="/assets/logo.png"
            onClick={() => window.location.reload()}
          />
        </HeaderContent>

        <MenuButton
          $isDark={isDarkMode}
          onClick={() => setShowDarkModal(true)}
          title="PORTY 설정"
          aria-label="PORTY 설정 열기"
        >
          <Menu size={20} />
        </MenuButton>

        <NotificationButton
          $isDark={isDarkMode}
          onClick={() => setShowDietModal(true)}
          title="식단 알림 설정"
          aria-label="식단 알림 설정 열기"
        >
          <Bell size={20} />
        </NotificationButton>
      </Header>

      {toastMessage && <Toast message={toastMessage} />}

      {/* FAQPreview — 반드시 ChatBody 밖에 있어야 정상 표시됨! */}
      {showFAQ && (
        <FAQPreview
          searchTerm={message}
          onSelect={(q) => {
            setShowFAQ(false);
            sendMessage(q);
          }}
          onClose={() => setShowFAQ(false)}
        />
      )}

      <ChatBody ref={chatBodyRef} $isDark={isDarkMode}>
        {chats.map((c, idx) => (
          <div key={idx}>
            {c.component ? (
              <div style={{ display: "flex" }}>{c.component}</div>
            ) : (
              <>
                <ChatBubble
                  message={c.text}
                  isUser={c.sender === "user"}
                  isDark={isDarkMode}
                />

                {c.showQuickActions && (
                  <QuickActions
                    onActionClick={sendMessage}
                    hasDietSettings={!!dietSettings}
                    isDark={isDarkMode}
                  />
                )}
              </>
            )}
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
        <InputWrapper>
          <StyledInput
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setShowFAQ(true)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="공주대 9공학관은 어디야?"
          />

          <SendButton $isDark={isDarkMode} onClick={() => sendMessage()}>
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

      <FloatingMenu
        isDark={isDarkMode}
        onOpenDarkMode={() => setShowDarkModal(true)}
        onOpenDietSettings={() => setShowDietModal(true)}
      />
    </ChatContainer>
  );
};

export default ChatPage;
