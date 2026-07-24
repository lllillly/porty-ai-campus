import React from "react";

import ChatBubble from "./ChatBubble";
import QuickActions from "./QuickActions";
import ShuttleCard from "./ShuttleCard";
import StudentNewsCard from "./StudentNewsCard";
import WelcomeIntro from "./WelcomeIntro";

const ComponentFrame = ({ children }) => (
  <div style={{ display: "flex" }}>{children}</div>
);

const ChatMessage = ({
  chat,
  isDark,
  hasDietSettings,
  onActionClick,
  onDietSetup,
  onBackToMain,
}) => {
  if (chat.showWelcome) {
    return (
      <WelcomeIntro
        onActionClick={onActionClick}
        onDietSetup={onDietSetup}
        hasDietSettings={hasDietSettings}
        isDark={isDark}
      />
    );
  }

  if (chat.presentation?.type === "shuttle") {
    return (
      <ComponentFrame>
        <ShuttleCard
          data={chat.presentation}
          onBackToMain={onBackToMain}
        />
      </ComponentFrame>
    );
  }

  if (chat.presentation?.type === "student-news") {
    return (
      <ComponentFrame>
        <StudentNewsCard
          data={chat.presentation}
          onRead={(index) =>
            onActionClick(`${index + 1}번 학생소식 내용 보여줘`)
          }
          onBackToMain={onBackToMain}
        />
      </ComponentFrame>
    );
  }

  if (chat.component) {
    return <ComponentFrame>{chat.component}</ComponentFrame>;
  }

  return (
    <>
      <ChatBubble
        message={chat.text}
        isUser={chat.sender === "user"}
        isDark={isDark}
      />

      {chat.showQuickActions && (
        <QuickActions
          onActionClick={onActionClick}
          onDietSetup={onDietSetup}
          hasDietSettings={hasDietSettings}
          isDark={isDark}
        />
      )}
    </>
  );
};

export default ChatMessage;
