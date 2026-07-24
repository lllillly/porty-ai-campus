import React from "react";
import styled from "styled-components";

import ChatBubble from "./ChatBubble";
import QuickActions from "./QuickActions";
import ShuttleCard from "./ShuttleCard";
import StudentNewsCard from "./StudentNewsCard";
import WelcomeIntro from "./WelcomeIntro";

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
      <CardFrame>
        <ShuttleCard
          data={chat.presentation}
          onBackToMain={onBackToMain}
        />
      </CardFrame>
    );
  }

  if (chat.presentation?.type === "student-news") {
    return (
      <CardFrame>
        <StudentNewsCard
          data={chat.presentation}
          onRead={(index) =>
            onActionClick(`${index + 1}번 학생소식 내용 보여줘`)
          }
          onBackToMain={onBackToMain}
        />
      </CardFrame>
    );
  }

  if (chat.component) {
    return <CardFrame>{chat.component}</CardFrame>;
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

const CardFrame = styled.div`
  display: flex;
`;

export default ChatMessage;
