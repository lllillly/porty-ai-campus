import styled from "styled-components";

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${(props) => (props.$isDark ? "#000" : "#FFF")};
  color: ${(props) => (props.$isDark ? "#EEE" : "#000")};
  position: relative;
  z-index: 0;
`;

export const Header = styled.div`
  height: 58px;
  background-color: ${(props) =>
    props.$isDark ? "#111111" : "rgba(168,200,224,0.1)"};
  border-bottom: 1px solid ${(props) => (props.$isDark ? "#1F1F1F" : "#E5E8EB")};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  box-shadow: 0 1px 4px
    rgba(0, 0, 0, ${(props) => (props.$isDark ? "0.32" : "0.06")});

  @media (max-width: 768px) {
    height: 54px;
  }
`;

export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
`;

export const Logo = styled.img`
  height: 17px;
  cursor: pointer;
  object-fit: contain;

  @media (max-width: 768px) {
    height: 17px;
  }
`;

export const NotificationButton = styled.button`
  position: absolute;
  right: 1.3rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.4rem;
  color: ${(props) => (props.$isDark ? "#CCC" : "#9DABCF")};
`;

export const MenuButton = styled.button`
  position: absolute;
  right: 3.2rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.4rem;
  color: ${(props) => (props.$isDark ? "#CCC" : "#9DABCF")};
`;

export const ChatBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
  background-color: ${(props) => (props.$isDark ? "#000" : "#FFF")};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => (props.$isDark ? "#444" : "#9DABCF")};
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    padding: 1.4rem 1rem;
    gap: 1rem;
  }
`;

export const MessageWrapper = styled.div`
  display: flex;
  gap: 0.7rem;
  ${(props) => props.$isUser && "justify-content: flex-end;"}
`;

export const AvatarWrapper = styled.div`
  width: 40px;
  height: 40px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const MessageBubble = styled.div`
  max-width: 65%;
  padding: 0.6rem 0.85rem;
  border-radius: 16px;
  background-color: ${(props) =>
    props.$isDark
      ? props.$isUser
        ? "#111"
        : "#1C1C1C"
      : props.$isUser
        ? "#A8C8E0"
        : "#EAEFFF"};

  color: ${(props) => (props.$isDark ? "#EEE" : "#414756")};
  font-size: 0.9rem;
  line-height: 1.32;
  white-space: pre-wrap;
  word-break: break-word;

  h1,
  h2,
  h3,
  p,
  ul,
  li {
    margin: 0.1em 0;
  }
`;

export const QuickActionsWrapper = styled.div`
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
  margin-left: 3rem;
  margin-top: 0.4rem;

  @media (max-width: 768px) {
    margin-left: 2.4rem;
  }
`;

export const QuickActionButton = styled.button`
  background-color: ${(props) => (props.$isDark ? "#333" : "#9DABCF")};
  color: ${(props) => (props.$isDark ? "#FFF" : "#414756")};
  border: none;
  padding: 0.55rem 1rem;
  border-radius: 18px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: 0.15s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

export const InputArea = styled.div`
  background-color: ${(props) => (props.$isDark ? "#111" : "#A8C8E0")};
  padding: 1.2rem 1.4rem;
  border-radius: 20px 20px 0 0;
`;

export const InputWrapper = styled.div`
  background: #fff;
  border-radius: 20px;
  padding: 0.55rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

export const StyledInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.92rem;
  background: transparent;

  &::placeholder {
    color: #999;
  }
`;

export const SendButton = styled.button`
  background: none;
  border: none;
  font-size: 1.35rem;
  color: ${(props) => (props.$isDark ? "#FFF" : "#414756")};
  cursor: pointer;
`;

export const FloatingArea = styled.div`
  position: fixed;
  right: 1.4rem;
  bottom: 5.4rem;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
`;

export const FabButton = styled.button`
  width: 54px;
  height: 54px;
  border: none;
  border-radius: 50%;
  background-color: ${(props) => (props.$isDark ? "#333" : "#9DABCF")};
  color: #fff;
  font-size: 1.4rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.22);
  cursor: pointer;
`;

export const OptionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  pointer-events: ${(props) => (props.$open ? "auto" : "none")};
`;

export const OptionFab = styled.button`
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background-color: ${(props) => (props.$isDark ? "#222" : "#FFF")};
  color: ${(props) => (props.$isDark ? "#FFF" : "#414756")};
  font-size: 1.2rem;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.18);
  cursor: pointer;

  opacity: ${(props) => (props.$open ? 1 : 0)};
  transform: translateY(${(props) => (props.$open ? "0" : "6px")});
  transition: all 0.18s ease;
`;

export const ToastContainer = styled.div`
  position: absolute;
  top: 70px;
  left: 50%;
  padding: 0.55rem 1rem;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  border-radius: 12px;
  font-size: 0.85rem;
  z-index: 999;

  animation: toastAnim 1.8s ease forwards;

  @keyframes toastAnim {
    0% {
      opacity: 0;
      transform: translate(-50%, -8px);
    }
    15% {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    85% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -5px);
    }
  }
`;

export const SplashOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: linear-gradient(180deg, #ffffff 0%, #f3f6fb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  animation: splashFade 1s ease forwards;
  animation-delay: 1.4s;

  @keyframes splashFade {
    to {
      opacity: 0;
      visibility: hidden;
    }
  }
`;

export const SplashBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  animation: splashPop 0.7s ease;

  @keyframes splashPop {
    0% {
      transform: scale(0.92) translateY(6px);
      opacity: 0;
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }
`;

export const SplashImage = styled.img`
  width: 78px;
  height: 78px;
  object-fit: contain;
  background: #fff;
  padding: 0.8rem;
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
`;

export const SplashLogo = styled.div`
  font-size: 1.8rem;
  font-weight: 800;
  color: #414756;
`;

export const SplashSubtitle = styled.div`
  font-size: 0.92rem;
  color: #6b7280;
`;
