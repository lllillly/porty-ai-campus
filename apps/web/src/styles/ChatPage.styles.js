import styled from "styled-components";

const palette = {
  green: "#78D6AD",
  greenHover: "#348F6B",
  mint: "#E4F8EF",
  yellow: "#FFD879",
  blush: "#F8DFE6",
  lavender: "#EEEAF8",
  canvas: "#FAF9F5",
  text: "#26352F",
  subtext: "#718079",
  border: "#E6E8E2",
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
  flex: 0 0 72px;
  display: flex;
  align-items: center;
  background: ${({ $isDark }) =>
    $isDark ? "rgba(29, 37, 33, 0.96)" : "rgba(255, 253, 249, 0.96)"};
  border-bottom: 1px solid
    ${({ $isDark }) => ($isDark ? "#34413A" : "#ECECE5")};
  backdrop-filter: blur(16px);
  z-index: 30;

  @media (max-width: 768px) {
    flex-basis: 66px;
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
  width: 38px;
  height: 56px;
  flex: 0 0 38px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  object-fit: contain;

  @media (max-width: 768px) {
    width: 34px;
    height: 50px;
    flex-basis: 34px;
  }
`;

export const BrandCopy = styled.span`
  min-width: 0;
  display: grid;
  gap: 3px;
`;

export const BrandName = styled.strong`
  color: ${({ $isDark }) => ($isDark ? "#F5F7F6" : palette.text)};
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.15;
`;

export const BrandStatus = styled.span`
  display: block;
  color: ${({ $isDark }) => ($isDark ? "#AEB8B3" : palette.subtext)};
  font-size: 11px;
  font-weight: 550;
  line-height: 1.2;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  > button:first-child {
    background: var(--porty-blush);
  }

  > button:last-child {
    background: var(--porty-primary-soft);
  }
`;

const HeaderIconButton = styled.button`
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: ${({ $isDark }) => ($isDark ? "#252E29" : "#F3F4EF")};
  color: ${({ $isDark }) => ($isDark ? "#D8DEDB" : "#4F5C56")};
  cursor: pointer;
  transition:
    background 160ms ease,
    color 160ms ease,
    transform 160ms ease;

  &:hover {
    background: ${({ $isDark }) => ($isDark ? "#213C31" : "#E4F8EF")};
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
  padding: clamp(24px, 5vh, 48px) 24px 34px;
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
  width: min(100%, 820px);
  min-width: 0;
  margin: 0 auto;
  display: grid;
  grid-template:
    "scene prompt" auto
    "scene actions" 1fr / minmax(290px, 0.92fr) minmax(0, 1.08fr);
  column-gap: clamp(24px, 4vw, 46px);
  align-items: start;

  @media (max-width: 720px) {
    grid-template:
      "scene" auto
      "prompt" auto
      "actions" auto / 1fr;
    gap: 0;
  }
`;

export const WelcomeCopy = styled.div`
  grid-area: scene;
  min-height: 404px;
  position: relative;
  overflow: hidden;
  padding: 30px;
  border-radius: 38px 38px 38px 14px;
  background: ${({ $isDark }) => ($isDark ? "#213C31" : "#E7F7EF")};

  &::before,
  &::after {
    position: absolute;
    border-radius: 50%;
    content: "";
  }

  &::before {
    width: 84px;
    height: 84px;
    top: -28px;
    right: 30px;
    background: ${({ $isDark }) => ($isDark ? "#49363E" : palette.blush)};
  }

  &::after {
    width: 48px;
    height: 48px;
    bottom: 26px;
    left: 24px;
    background: ${({ $isDark }) => ($isDark ? "#443A22" : "#FFEAB8")};
  }

  > div:last-child {
    width: min(100%, 270px);
    position: relative;
    z-index: 2;
    padding: 21px 22px;
    border-radius: 25px 25px 25px 8px;
    background: var(--porty-surface);
    box-shadow: 0 12px 30px rgba(80, 105, 91, 0.08);
  }

  @media (max-width: 720px) {
    min-height: 270px;
    padding: 22px;
    margin-bottom: 28px;

    > div:last-child {
      width: min(72%, 310px);
      padding: 17px 18px;
    }
  }

  @media (max-width: 420px) {
    min-height: 252px;
    padding: 18px;

    > div:last-child {
      width: 76%;
    }
  }
`;

export const WelcomeCharacter = styled.div`
  width: 230px;
  height: 300px;
  position: absolute;
  right: -7px;
  bottom: -19px;
  z-index: 1;

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
    object-position: center bottom;
  }

  @media (max-width: 720px) {
    width: 164px;
    height: 226px;
    right: 5px;
    bottom: -20px;
  }

  @media (max-width: 420px) {
    width: 145px;
    height: 205px;
    right: -2px;
  }
`;

export const WelcomeTitle = styled.h1`
  margin: 0;
  color: var(--porty-text);
  font-size: clamp(22px, 2.4vw, 28px);
  font-weight: 780;
  letter-spacing: -0.04em;
  line-height: 1.32;
  word-break: keep-all;
`;

export const WelcomeDescription = styled.p`
  margin: 9px 0 0;
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
  grid-area: prompt;
  margin: 10px 0 15px;
  display: grid;
  gap: 4px;

  span {
    color: var(--porty-text);
    font-size: 18px;
    font-weight: 760;
    letter-spacing: -0.025em;
  }

  small {
    color: var(--porty-subtext);
    font-size: 12px;
    font-weight: 450;
  }

  @media (max-width: 720px) {
    margin: 0 2px 14px;
  }
`;

export const MessageWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: ${({ $isUser }) => ($isUser ? "flex-end" : "flex-start")};
  gap: 11px;
`;

export const AvatarWrapper = styled.div`
  width: 32px;
  height: 48px;
  flex: 0 0 32px;
  padding: 0;
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
  }
`;

export const MessageBubble = styled.div`
  max-width: min(78%, 640px);
  padding: 12px 15px;
  border: 0;
  border-radius: ${({ $isUser }) =>
    $isUser ? "20px 20px 7px 20px" : "20px 20px 20px 7px"};
  background: ${({ $isDark, $isUser }) =>
    $isUser
      ? $isDark
        ? "#2C6B52"
        : "#DDF6E9"
      : $isDark
        ? "#1D2521"
        : palette.lavender};
  color: ${({ $isDark, $isUser }) =>
    $isUser ? ($isDark ? "#F2FFF8" : "#214636") : $isDark ? "#F5F7F6" : palette.text};
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
  grid-area: ${({ $featured }) => ($featured ? "actions" : "auto")};
  width: ${({ $featured }) =>
    $featured ? "100%" : "min(calc(100% - 53px), 680px)"};
  min-width: 0;
  margin: ${({ $featured }) => ($featured ? "0" : "12px 0 0 53px")};
  display: grid;
  grid-template-columns: ${({ $featured }) =>
    $featured
      ? "repeat(2, minmax(0, 1fr))"
      : "repeat(3, minmax(0, 1fr))"};
  gap: ${({ $featured }) => ($featured ? "10px" : "8px")};

  @media (max-width: 620px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const QuickActionButton = styled.button`
  min-width: 0;
  min-height: ${({ $featured }) => ($featured ? "92px" : "66px")};
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: ${({ $featured }) => ($featured ? "15px" : "10px")};
  border: 0;
  border-radius: ${({ $featured }) => ($featured ? "20px" : "15px")};
  background: ${({ $isDark }) => ($isDark ? "#1D2521" : "#FFFEFA")};
  color: ${({ $isDark }) => ($isDark ? "#E7ECE9" : "#315245")};
  text-align: left;
  box-shadow: ${({ $featured, $isDark }) =>
    $featured && !$isDark
      ? "0 8px 22px rgba(70, 91, 80, 0.055)"
      : "none"};
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    transform 160ms ease;

  > span {
    width: ${({ $featured }) => ($featured ? "42px" : "32px")};
    height: ${({ $featured }) => ($featured ? "42px" : "32px")};
    flex: 0 0 ${({ $featured }) => ($featured ? "42px" : "32px")};
    display: grid;
    place-items: center;
    border-radius: 14px;
    background: var(--porty-primary-soft);
    color: var(--porty-primary-hover);
  }

  &:nth-child(2) > span {
    background: var(--porty-blush);
    color: #a75c71;
  }

  &:nth-child(3) > span {
    background: var(--porty-lavender);
    color: #756b9b;
  }

  &:nth-child(4) > span {
    background: var(--porty-accent-soft);
    color: var(--porty-accent-text);
  }

  &:nth-child(5) > span {
    background: ${({ $isDark }) => ($isDark ? "#293E48" : "#E6F2F8")};
    color: ${({ $isDark }) => ($isDark ? "#93C4D9" : "#4E8CA8")};
  }

  &:nth-child(6) > span {
    background: ${({ $isDark }) => ($isDark ? "#493A31" : "#FCEADF")};
    color: ${({ $isDark }) => ($isDark ? "#E5B492" : "#B66F48")};
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
    background: ${({ $isDark }) => ($isDark ? "#223A2F" : "#F9FBF8")};
    transform: translateY(-2px);
  }

  @media (max-width: 480px) {
    min-height: ${({ $featured }) => ($featured ? "84px" : "66px")};
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
  padding: 16px 24px max(17px, env(safe-area-inset-bottom));
  border-top: 0;
  border-radius: 28px 28px 0 0;
  background: ${({ $isDark }) =>
    $isDark ? "#1D2521" : "#E7F5EE"};
  z-index: 25;

  @media (max-width: 768px) {
    padding: 12px 14px max(12px, env(safe-area-inset-bottom));
  }
`;

export const InputWrapper = styled.div`
  width: min(100%, 820px);
  min-height: 58px;
  margin: 0 auto;
  padding: 7px 8px 7px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 0;
  border-radius: 22px;
  background: ${({ $isDark }) => ($isDark ? "#252E29" : "#FFFDF9")};
  box-shadow: ${({ $isDark }) =>
    $isDark ? "none" : "0 7px 22px rgba(76, 105, 89, 0.08)"};

  &:focus-within {
    background: var(--porty-surface);
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
  background: #eef8f2;
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
