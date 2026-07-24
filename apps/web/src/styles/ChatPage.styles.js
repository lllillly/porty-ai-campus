import styled from "styled-components";

const palette = {
  green: "#08B86A",
  greenHover: "#079D5B",
  mint: "#DDF7EA",
  canvas: "#EEF5F2",
  text: "#171C1A",
  subtext: "#65706B",
  border: "#DFE7E3",
};

export const ChatContainer = styled.main`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  position: relative;
  z-index: 0;
  background: ${({ $isDark }) => ($isDark ? "#111513" : palette.canvas)};
  color: ${({ $isDark }) => ($isDark ? "#F5F7F6" : palette.text)};
`;

export const Header = styled.header`
  flex: 0 0 72px;
  display: flex;
  align-items: center;
  background: ${({ $isDark }) =>
    $isDark ? "rgba(27, 33, 30, 0.96)" : "rgba(255, 255, 255, 0.96)"};
  border-bottom: 1px solid
    ${({ $isDark }) => ($isDark ? "#303934" : palette.border)};
  backdrop-filter: blur(16px);
  z-index: 30;

  @media (max-width: 768px) {
    flex-basis: 64px;
  }
`;

export const HeaderContent = styled.div`
  width: min(100%, 920px);
  min-width: 0;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 768px) {
    padding: 0 14px;
  }
`;

export const BrandButton = styled.button`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
`;

export const Logo = styled.img`
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  object-fit: contain;

  @media (max-width: 768px) {
    width: 38px;
    height: 38px;
    flex-basis: 38px;
  }
`;

export const BrandCopy = styled.span`
  min-width: 0;
  display: grid;
  gap: 2px;
`;

export const BrandName = styled.strong`
  color: ${({ $isDark }) => ($isDark ? "#F5F7F6" : palette.text)};
  font-size: 16px;
  font-weight: 750;
  letter-spacing: -0.02em;
  line-height: 1.15;
`;

export const BrandStatus = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${({ $isDark }) => ($isDark ? "#AEB8B3" : palette.subtext)};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;

  &::before {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${palette.green};
    box-shadow: 0 0 0 3px rgba(8, 184, 106, 0.14);
    content: "";
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HeaderIconButton = styled.button`
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: ${({ $isDark }) => ($isDark ? "#D8DEDB" : "#4F5C56")};
  cursor: pointer;
  transition:
    background 160ms ease,
    color 160ms ease,
    transform 160ms ease;

  &:hover {
    background: ${({ $isDark }) => ($isDark ? "#242B27" : "#F1F6F3")};
    color: ${({ $isDark }) => ($isDark ? "#24D184" : palette.greenHover)};
  }

  &:active {
    transform: scale(0.96);
  }
`;

export const NotificationButton = styled(HeaderIconButton)``;
export const MenuButton = styled(HeaderIconButton)``;

export const ChatBody = styled.section`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 30px 24px 36px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background:
    radial-gradient(
      circle at 18% -10%,
      ${({ $isDark }) =>
          $isDark ? "rgba(8, 184, 106, 0.08)" : "rgba(255, 255, 255, 0.92)"}
        0,
      transparent 34%
    ),
    ${({ $isDark }) => ($isDark ? "#111513" : palette.canvas)};

  > div {
    width: min(100%, 820px);
    margin: 0 auto;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border: 2px solid transparent;
    border-radius: 999px;
    background: ${({ $isDark }) => ($isDark ? "#46514B" : "#C4D2CB")};
    background-clip: padding-box;
  }

  @media (max-width: 768px) {
    padding: 22px 14px 28px;
    gap: 16px;
  }
`;

export const MessageWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: ${({ $isUser }) => ($isUser ? "flex-end" : "flex-start")};
  gap: 10px;
`;

export const AvatarWrapper = styled.div`
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  overflow: hidden;
  border-radius: 13px;
  box-shadow: 0 4px 12px rgba(8, 89, 53, 0.13);

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
  }
`;

export const MessageBubble = styled.div`
  max-width: min(76%, 620px);
  padding: 11px 14px;
  border: 1px solid
    ${({ $isDark, $isUser }) =>
      $isUser ? "transparent" : $isDark ? "#303934" : palette.border};
  border-radius: ${({ $isUser }) =>
    $isUser ? "18px 6px 18px 18px" : "6px 18px 18px 18px"};
  background: ${({ $isDark, $isUser }) =>
    $isUser ? palette.green : $isDark ? "#1B211E" : "#FFFFFF"};
  box-shadow: ${({ $isUser, $isDark }) =>
    $isUser || $isDark ? "none" : "0 8px 24px rgba(28, 54, 42, 0.06)"};
  color: ${({ $isDark, $isUser }) =>
    $isUser ? "#10251A" : $isDark ? "#F5F7F6" : palette.text};
  font-size: 14px;
  font-weight: 450;
  line-height: 1.58;
  letter-spacing: -0.01em;
  white-space: pre-wrap;
  word-break: break-word;

  h1,
  h2,
  h3,
  p,
  ul,
  ol,
  li {
    margin: 0;
  }

  p + p,
  p + ul,
  p + ol,
  ul + p,
  ol + p {
    margin-top: 8px;
  }

  ul,
  ol {
    padding-left: 20px;
  }

  a {
    color: inherit;
    font-weight: 700;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
  }

  @media (max-width: 560px) {
    max-width: calc(100% - 52px);
    font-size: 14px;
  }
`;

export const QuickActionsWrapper = styled.div`
  max-width: calc(100% - 48px);
  margin: 10px 0 0 48px;
  padding: 2px 0;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const QuickActionButton = styled.button`
  min-height: 40px;
  flex: 0 0 auto;
  padding: 9px 14px;
  border: 1px solid
    ${({ $isDark }) => ($isDark ? "#3B4740" : "#C8D8D0")};
  border-radius: 999px;
  background: ${({ $isDark }) => ($isDark ? "#1B211E" : "#FFFFFF")};
  color: ${({ $isDark }) => ($isDark ? "#E7ECE9" : "#315245")};
  font-size: 13px;
  font-weight: 650;
  white-space: nowrap;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    transform 160ms ease;

  &:hover {
    border-color: ${palette.green};
    background: ${({ $isDark }) => ($isDark ? "#223A2F" : palette.mint)};
    transform: translateY(-1px);
  }
`;

export const InputArea = styled.footer`
  flex: 0 0 auto;
  padding: 16px 24px max(16px, env(safe-area-inset-bottom));
  border-top: 1px solid
    ${({ $isDark }) => ($isDark ? "#303934" : palette.border)};
  background: ${({ $isDark }) =>
    $isDark ? "rgba(27, 33, 30, 0.98)" : "rgba(255, 255, 255, 0.97)"};
  backdrop-filter: blur(16px);
  z-index: 25;

  @media (max-width: 768px) {
    padding: 12px 14px max(12px, env(safe-area-inset-bottom));
  }
`;

export const InputWrapper = styled.div`
  width: min(100%, 820px);
  min-height: 52px;
  margin: 0 auto;
  padding: 5px 6px 5px 17px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid
    ${({ $isDark }) => ($isDark ? "#3A443F" : "#D6E1DC")};
  border-radius: 999px;
  background: ${({ $isDark }) => ($isDark ? "#242B27" : "#F8FAF9")};
  box-shadow: 0 8px 24px rgba(28, 54, 42, 0.06);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;

  &:focus-within {
    border-color: ${palette.green};
    box-shadow: 0 0 0 3px rgba(8, 184, 106, 0.13);
  }
`;

export const StyledInput = styled.input`
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: ${({ $isDark }) => ($isDark ? "#F5F7F6" : palette.text)};
  font-size: 15px;
  line-height: 1.4;

  &::placeholder {
    color: ${({ $isDark }) => ($isDark ? "#87918C" : "#89938E")};
  }
`;

export const SendButton = styled.button`
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: ${({ disabled }) => (disabled ? "#B9C5BF" : palette.green)};
  color: ${({ disabled }) => (disabled ? "#66716C" : "#10251A")};
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  transition:
    background 160ms ease,
    transform 160ms ease;

  &:hover:not(:disabled) {
    background: ${palette.greenHover};
    color: white;
    transform: translateY(-1px);
  }

  svg {
    ${({ $loading }) => $loading && "animation: spin 900ms linear infinite;"}
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const FloatingArea = styled.div`
  position: fixed;
  right: 20px;
  bottom: 92px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`;

export const FabButton = styled.button`
  width: 50px;
  height: 50px;
  border: 0;
  border-radius: 18px;
  background: ${palette.green};
  color: #10251a;
  font-size: 22px;
  box-shadow: 0 10px 24px rgba(8, 112, 67, 0.24);
  cursor: pointer;
`;

export const OptionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
`;

export const OptionFab = styled.button`
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 1px solid
    ${({ $isDark }) => ($isDark ? "#303934" : palette.border)};
  border-radius: 15px;
  background: ${({ $isDark }) => ($isDark ? "#1B211E" : "#FFFFFF")};
  color: ${({ $isDark }) => ($isDark ? "#F5F7F6" : palette.text)};
  box-shadow: 0 8px 24px rgba(28, 54, 42, 0.12);
  cursor: pointer;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transform: translateY(${({ $open }) => ($open ? "0" : "6px")});
  transition: all 180ms ease;
`;

export const ToastContainer = styled.div`
  position: absolute;
  top: 84px;
  left: 50%;
  max-width: calc(100% - 32px);
  padding: 10px 16px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: rgba(23, 28, 26, 0.92);
  color: white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  font-size: 13px;
  font-weight: 600;
  z-index: 999;
  animation: toastAnim 1.8s ease forwards;

  @keyframes toastAnim {
    0%,
    100% {
      opacity: 0;
      transform: translate(-50%, -6px);
    }
    15%,
    85% {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
`;

export const SplashOverlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 50% 38%, #ffffff 0, #eef8f3 48%, #e4f2eb 100%);
  z-index: 500;
  animation: splashFade 500ms ease forwards;
  animation-delay: 1.15s;

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
  gap: 7px;
  animation: splashPop 600ms cubic-bezier(0.2, 0.8, 0.2, 1);

  @keyframes splashPop {
    from {
      opacity: 0;
      transform: scale(0.92) translateY(8px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

export const SplashImage = styled.img`
  width: 76px;
  height: 76px;
  margin-bottom: 6px;
  object-fit: contain;
  filter: drop-shadow(0 12px 20px rgba(8, 112, 67, 0.2));
`;

export const SplashLogo = styled.div`
  color: ${palette.text};
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
`;

export const SplashSubtitle = styled.div`
  color: ${palette.subtext};
  font-size: 13px;
  font-weight: 500;
`;
