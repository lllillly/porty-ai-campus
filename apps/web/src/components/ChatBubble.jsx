import React from "react";
import ReactMarkdown from "react-markdown";
import { ExternalLink } from "react-feather";
import { MessageWrapper, AvatarWrapper, MessageBubble } from "../styles/ChatPage.styles";

const ChatBubble = ({ message, isUser, isDark }) => {
  return (
    <MessageWrapper $isUser={isUser}>
      {!isUser && (
        <AvatarWrapper $isDark={isDark}>
          <img src="/assets/knung.png" alt="크눙이" />
        </AvatarWrapper>
      )}
      <MessageBubble $isUser={isUser} $isDark={isDark}>
        <ReactMarkdown
          components={{
            a: ({ children, ...props }) => (
              <a {...props} target="_blank" rel="noreferrer">
                <span>{children}</span>
                <ExternalLink size={12} />
              </a>
            ),
          }}
        >
          {message}
        </ReactMarkdown>
      </MessageBubble>
    </MessageWrapper>
  );
};

export default ChatBubble;
