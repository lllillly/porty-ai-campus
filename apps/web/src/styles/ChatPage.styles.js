import styled from "styled-components";

const palette = {
  green: "#72BD89",
  greenHover: "#357653",
  mint: "#EDF7F0",
  canvas: "#FAFCFB",
  text: "#26352D",
  subtext: "#718078",
  border: "#E1E9E3",
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
  background: ${({ $isDark }) => ($isDark ? "#141A17" : palette.canvas)};
  color: ${({ $isDark }) => ($isDark ? "#F5F7F6" : palette.text)};
`;

export const Header = styled.header`
  flex: 0 0 62px;
  display: flex;
  align-items: center;
  background: ${({ $isDark }) =>
    $isDark ? "rgba(29, 37, 33, 0.97)" : "rgba(255, 255, 255, 0.97)"};
  border-bottom: 1px solid
    ${({ $isDark }) => ($isDark ? "#34413A" : palette.border)};
  z-index: 30;

  @media (max-width: 768px) {
    flex-basis: 58px;
  }
`;

export const HeaderContent = styled.div`
  width: min(100%, 820px);
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
  gap: 9px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: opacity 160ms ease;

  &:hover {
    opacity: 0.76;
  }
`;

export const Logo = styled.img`
  width: 38px;
  height: 42px;
  flex: 0 0 38px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  object-fit: cover;
  object-position: center 12%;

  @media (max-width: 768px) {
    width: 34px;
    height: 38px;
    flex-basis: 34px;
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
  font-weight: 760;
  letter-spacing: -0.035em;
  line-height: 1.15;
`;

export const BrandStatus = styled.span`
  display: block;
  color: ${({ $isDark }) => ($isDark ? "#AEB8B3" : palette.subtext)};
  font-size: 10px;
  font-weight: 450;
  line-height: 1.2;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  padding-left: 10px;
  border-left: 1px solid var(--porty-border);
`;

const HeaderIconButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: ${({ $isDark }) => ($isDark ? "#D8DEDB" : "#426050")};
  cursor: pointer;
  transition:
    background 160ms ease,
    color 160ms ease,
    transform 160ms ease;

  &:hover {
    background: ${({ $isDark }) => ($isDark ? "#213C31" : palette.mint)};
    color: ${({ $isDark }) => ($isDark ? "#8CE2BD" : palette.greenHover)};
  }

  &:active {
    transform: scale(0.96);
  }

  span {
    display: none;
  }

  @media (max-width: 520px) {
    width: 34px;
    height: 34px;
  }
`;

export const NotificationButton = styled(HeaderIconButton)``;
export const MenuButton = styled(HeaderIconButton)``;

export const ChatBody = styled.section`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: clamp(30px, 6vh, 64px) 24px 38px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: ${({ $isDark }) => ($isDark ? "#141A17" : palette.canvas)};

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
    padding: 28px 14px 26px;
    gap: 16px;
  }

  @media (min-width: 721px) and (min-height: 760px) {
    justify-content: ${({ $isWelcome }) =>
      $isWelcome ? "center" : "flex-start"};
  }
`;

export const WelcomeCard = styled.section`
  width: min(100%, 720px);
  min-width: 0;
  margin: 0 auto;
  display: flex;
  flex-direction: column;

  @media (max-width: 720px) {
    width: 100%;
  }
`;

export const WelcomeCopy = styled.div`
  min-height: 210px;
  position: relative;
  overflow: hidden;
  padding: 38px 220px 34px 36px;
  border: 1px solid
    ${({ $isDark }) => ($isDark ? "#34413A" : palette.border)};
  border-radius: 20px;
  background: ${({ $isDark }) => ($isDark ? "#1D2521" : "#FFFFFF")};

  > div:last-child {
    position: relative;
    z-index: 2;
  }

  @media (max-width: 720px) {
    min-height: 190px;
    padding: 28px 150px 26px 24px;
  }

  @media (max-width: 420px) {
    min-height: 176px;
    padding: 24px 116px 22px 20px;
  }
`;

export const WelcomeCharacter = styled.div`
  width: 180px;
  height: 205px;
  position: absolute;
  right: 22px;
  bottom: -16px;
  z-index: 1;

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
    object-position: center bottom;
  }

  @media (max-width: 720px) {
    width: 135px;
    height: 175px;
    right: 8px;
    bottom: -14px;
  }

  @media (max-width: 420px) {
    width: 110px;
    height: 150px;
    right: 3px;
  }
`;

export const WelcomeTitle = styled.h1`
  margin: 0;
  color: var(--porty-text);
  font-size: clamp(22px, 3vw, 28px);
  font-weight: 760;
  letter-spacing: -0.04em;
  line-height: 1.32;
  word-break: keep-all;
`;

export const WelcomeDescription = styled.p`
  margin: 12px 0 0;
  color: var(--porty-subtext);
  font-size: 13px;
  font-weight: 450;
  line-height: 1.55;
  word-break: keep-all;

  @media (max-width: 520px) {
    font-size: 12px;
  }
`;

export const WelcomePrompt = styled.p`
  margin: 28px 4px 12px;
  display: grid;
  gap: 4px;

  span {
    color: var(--porty-text);
    font-size: 16px;
    font-weight: 730;
    letter-spacing: -0.025em;
  }

  small {
    color: var(--porty-subtext);
    font-size: 12px;
    font-weight: 450;
  }

  @media (max-width: 720px) {
    margin: 24px 2px 11px;
  }
`;

export const MessageWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: ${({ $isUser }) => ($isUser ? "flex-end" : "flex-start")};
  gap: 11px;
`;

export const AvatarWrapper = styled.div`
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 10px;
  background: var(--porty-primary-soft);

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center top;
  }
`;

export const MessageBubble = styled.div`
  max-width: min(78%, 640px);
  padding: 12px 15px;
  border: 1px solid
    ${({ $isDark, $isUser }) =>
      $isUser || $isDark ? "transparent" : palette.border};
  border-radius: ${({ $isUser }) =>
    $isUser ? "16px 16px 5px 16px" : "16px 16px 16px 5px"};
  background: ${({ $isDark, $isUser }) =>
    $isUser
      ? $isDark
        ? "#2C6B52"
        : "#DDF6E9"
      : $isDark
        ? "#1D2521"
        : "#FFFFFF"};
  color: ${({ $isDark, $isUser }) =>
    $isUser ? ($isDark ? "#F2FFF8" : "#214636") : $isDark ? "#F5F7F6" : palette.text};
  box-shadow: none;
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
    width: fit-content;
    max-width: 100%;
    min-height: 34px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 3px;
    padding: 7px 10px;
    border: 1px solid var(--porty-border);
    border-radius: 11px;
    background: var(--porty-surface-soft);
    color: var(--porty-primary-hover);
    font-size: 12px;
    font-weight: 750;
    line-height: 1.35;
    text-decoration: none;

    span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    svg {
      flex: 0 0 auto;
    }

    &:hover {
      border-color: var(--porty-primary);
      background: var(--porty-primary-soft);
    }
  }

  @media (max-width: 560px) {
    max-width: calc(100% - 52px);
    font-size: 14px;
  }
`;

export const QuickActionsWrapper = styled.div`
  width: ${({ $featured }) =>
    $featured ? "100%" : "min(calc(100% - 53px), 680px)"};
  min-width: 0;
  margin: ${({ $featured }) => ($featured ? "0" : "12px 0 0 53px")};
  display: grid;
  grid-template-columns: ${({ $featured }) =>
    $featured
      ? "repeat(3, minmax(0, 1fr))"
      : "repeat(3, minmax(0, 1fr))"};
  gap: ${({ $featured }) => ($featured ? "1px" : "8px")};
  overflow: ${({ $featured }) => ($featured ? "hidden" : "visible")};
  border-radius: ${({ $featured }) => ($featured ? "16px" : "0")};
  background: ${({ $featured }) =>
    $featured ? "var(--porty-border)" : "transparent"};
  box-shadow: ${({ $featured }) =>
    $featured ? "0 0 0 1px var(--porty-border)" : "none"};

  @media (max-width: 620px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const QuickActionButton = styled.button`
  min-width: 0;
  min-height: ${({ $featured }) => ($featured ? "76px" : "66px")};
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: ${({ $featured }) => ($featured ? "13px 14px" : "10px")};
  border: 0;
  border-radius: ${({ $featured }) => ($featured ? "0" : "15px")};
  background: ${({ $isDark }) => ($isDark ? "#1D2521" : "#FFFFFF")};
  color: ${({ $isDark }) => ($isDark ? "#E7ECE9" : "#315245")};
  text-align: left;
  box-shadow: none;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    transform 160ms ease;

  > span {
    width: ${({ $featured }) => ($featured ? "36px" : "32px")};
    height: ${({ $featured }) => ($featured ? "36px" : "32px")};
    flex: 0 0 ${({ $featured }) => ($featured ? "36px" : "32px")};
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: var(--porty-primary-soft);
    color: var(--porty-primary-hover);
  }

  > div {
    min-width: 0;
    display: grid;
    gap: 2px;
  }

  strong {
    color: var(--porty-text);
    font-size: ${({ $featured }) => ($featured ? "13px" : "12px")};
    font-weight: 760;
    white-space: nowrap;
  }

  small {
    overflow: hidden;
    color: var(--porty-subtext);
    font-size: ${({ $featured }) => ($featured ? "10px" : "9px")};
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    background: ${({ $isDark }) => ($isDark ? "#223A2F" : "#F6FAF7")};
  }

  @media (max-width: 480px) {
    min-height: ${({ $featured }) => ($featured ? "74px" : "66px")};
    padding: ${({ $featured }) => ($featured ? "12px 11px" : "10px")};

    > div {
      width: auto;
    }

    small {
      white-space: normal;
      line-height: 1.35;
    }

  }
`;

export const InputArea = styled.footer`
  flex: 0 0 auto;
  padding: 13px 24px max(14px, env(safe-area-inset-bottom));
  border-top: 1px solid
    ${({ $isDark }) => ($isDark ? "#34413A" : palette.border)};
  border-radius: 0;
  background: ${({ $isDark }) =>
    $isDark ? "#1D2521" : "#FFFFFF"};
  z-index: 25;

  @media (max-width: 768px) {
    padding: 12px 14px max(12px, env(safe-area-inset-bottom));
  }
`;

export const InputWrapper = styled.div`
  width: min(100%, 820px);
  min-height: 52px;
  margin: 0 auto;
  padding: 7px 8px 7px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid
    ${({ $isDark }) => ($isDark ? "#46514B" : "#CFDDD3")};
  border-radius: 14px;
  background: ${({ $isDark }) => ($isDark ? "#252E29" : "#FFFFFF")};
  box-shadow: none;

  &:focus-within {
    background: var(--porty-surface);
    border-color: var(--porty-primary);
  }
`;

export const InputIcon = styled.span`
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: grid;
  place-items: center;
  color: var(--porty-primary-hover);
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

  &:focus-visible {
    outline: 0;
  }
`;

export const SendButton = styled.button`
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 11px;
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
  background: #f1f9f3;
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
  width: 88px;
  height: 142px;
  margin-bottom: 4px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  object-fit: contain;
`;

export const SplashLogo = styled.div`
  color: ${palette.text};
  font-size: 25px;
  font-weight: 850;
  letter-spacing: -0.03em;
`;

export const SplashSubtitle = styled.div`
  color: ${palette.subtext};
  font-size: 12px;
  font-weight: 600;
`;
