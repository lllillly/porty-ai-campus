import React from "react";
import ReactMarkdown from "react-markdown";
import { MessageWrapper, AvatarWrapper, MessageBubble } from "../styles/ChatPage.styles";

const ChatBubble = ({ message, isUser, isDark }) => {
    return (
        <MessageWrapper $isUser={isUser}>
            {!isUser && (
                <AvatarWrapper>
                    <img
                        src="/assets/knung.png"
                        alt="크눙이"
                    />
                </AvatarWrapper>
            )}
            <MessageBubble $isUser={isUser} $isDark={isDark}>
                <ReactMarkdown>{message}</ReactMarkdown>
            </MessageBubble>
        </MessageWrapper>
    );
};

export default ChatBubble;
