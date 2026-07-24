import styled from "styled-components";

const palette = {
  green: "#78D6AD",
  greenHover: "#348F6B",
  mint: "#E4F8EF",
  yellow: "#FFD879",
  canvas: "#F5F8F3",
  text: "#26352F",
  subtext: "#718079",
  border: "#DFE9E2",
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
  flex: 0 0 78px;
  display: flex;
  align-items: center;
  background: ${({ $isDark }) =>
    $isDark ? "rgba(29, 37, 33, 0.95)" : "rgba(255, 254, 250, 0.93)"};
  border-bottom: 1px solid
    ${({ $isDark }) => ($isDark ? "#34413A" : "#E2EAE4")};
  box-shadow: ${({ $isDark }) =>
    $isDark ? "none" : "0 7px 24px rgba(65, 98, 80, 0.05)"};
  backdrop-filter: blur(20px);
  z-index: 30;

  @media (max-width: 768px) {
    flex-basis: 70px;
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
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  padding: 2px;
  border: 2px solid
    ${({ $isDark }) => ($isDark ? "#405047" : "#FFFFFF")};
  border-radius: 14px;
  background: ${({ $isDark }) => ($isDark ? "#2A352F" : "#FFF3CF")};
  box-shadow: none;
  object-fit: contain;

  @media (max-width: 768px) {
    width: 43px;
    height: 43px;
    flex-basis: 43px;
  }
`;

export const BrandCopy = styled.span`
  min-width: 0;
  display: grid;
  gap: 3px;
`;

export const BrandName = styled.strong`
  color: ${({ $isDark }) => ($isDark ? "#F5F7F6" : palette.text)};
  font-size: 18px;
  font-weight: 850;
  letter-spacing: -0.04em;
  line-height: 1.15;
`;

export const BrandStatus = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${({ $isDark }) => ($isDark ? "#AEB8B3" : palette.subtext)};
  font-size: 11px;
  font-weight: 650;
  line-height: 1.2;

  &::before {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${palette.green};
    box-shadow: 0 0 0 3px rgba(120, 214, 173, 0.18);
    content: "";
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HeaderIconButton = styled.button`
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid
    ${({ $isDark }) => ($isDark ? "#34413A" : "#E3ECE6")};
  border-radius: 12px;
  background: ${({ $isDark }) => ($isDark ? "#252E29" : "#F7FAF7")};
  color: ${({ $isDark }) => ($isDark ? "#D8DEDB" : "#4F5C56")};
  cursor: pointer;
  transition:
    background 160ms ease,
    color 160ms ease,
    transform 160ms ease;

  &:hover {
    background: ${({ $isDark }) => ($isDark ? "#213C31" : "#EAF8F1")};
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
  padding: clamp(32px, 7vh, 72px) 24px 38px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: ${({ $isDark }) => ($isDark ? "#141A17" : "#F6F8F6")};

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
`;

export const WelcomeCard = styled.section`
  width: min(100%, 720px);
  margin: 0 auto;
  padding: 18px 0 28px;
`;

export const WelcomeCopy = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 620px) {
    gap: 14px;
    margin-bottom: 26px;
  }
`;

export const WelcomeCharacter = styled.div`
  width: 88px;
  height: 88px;
  flex: 0 0 88px;
  display: grid;
  place-items: center;
  border: 1px solid var(--porty-border);
  border-radius: 24px;
  background: var(--porty-accent-soft);

  img {
    width: 72px;
    height: 72px;
    object-fit: contain;
  }

  @media (max-width: 620px) {
    width: 68px;
    height: 68px;
    flex-basis: 68px;
    border-radius: 19px;

    img {
      width: 56px;
      height: 56px;
    }
  }
`;

export const WelcomeTitle = styled.h1`
  margin: 0;
  color: var(--porty-text);
  font-size: clamp(25px, 3vw, 32px);
  font-weight: 780;
  letter-spacing: -0.045em;
  line-height: 1.25;
`;

export const WelcomeDescription = styled.p`
  margin: 8px 0 0;
  color: var(--porty-subtext);
  font-size: 13px;
  font-weight: 450;
  line-height: 1.55;

  @media (max-width: 520px) {
    font-size: 12px;
  }
`;

export const WelcomePrompt = styled.p`
  margin: 0 0 11px;
  color: var(--porty-subtext);
  font-size: 12px;
  font-weight: 700;
`;

export const MessageWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: ${({ $isUser }) => ($isUser ? "flex-end" : "flex-start")};
  gap: 11px;
`;

export const AvatarWrapper = styled.div`
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  padding: 2px;
  overflow: hidden;
  border: 2px solid ${({ $isDark }) => ($isDark ? "#34413A" : "#FFFFFF")};
  border-radius: 12px;
  background: var(--porty-accent-soft);
  box-shadow: none;

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
  border: 1px solid
    ${({ $isDark, $isUser }) =>
      $isUser ? "rgba(87, 164, 128, 0.12)" : $isDark ? "#34413A" : "#E1EAE4"};
  border-radius: 16px;
  background: ${({ $isDark, $isUser }) =>
    $isUser
      ? $isDark
        ? "#2C6B52"
        : "#D9F5E8"
      : $isDark
        ? "#1D2521"
        : "#FFFEFA"};
  box-shadow: none;
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
  width: ${({ $featured }) =>
    $featured ? "100%" : "min(calc(100% - 53px), 680px)"};
  margin: ${({ $featured }) => ($featured ? "0" : "12px 0 0 53px")};
  display: grid;
  grid-template-columns: ${({ $featured }) =>
    $featured
      ? "repeat(3, minmax(0, 1fr))"
      : "repeat(3, minmax(0, 1fr))"};
  gap: ${({ $featured }) => ($featured ? "9px" : "8px")};

  @media (max-width: 620px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const QuickActionButton = styled.button`
  min-width: 0;
  min-height: ${({ $featured }) => ($featured ? "78px" : "66px")};
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: ${({ $featured }) => ($featured ? "12px" : "10px")};
  border: 1px solid
    ${({ $isDark }) => ($isDark ? "#34413A" : "#E0E9E3")};
  border-radius: ${({ $featured }) => ($featured ? "14px" : "13px")};
  background: ${({ $isDark }) => ($isDark ? "#1D2521" : "#FFFEFA")};
  color: ${({ $isDark }) => ($isDark ? "#E7ECE9" : "#315245")};
  text-align: left;
  box-shadow: none;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    transform 160ms ease;

  > span {
    width: ${({ $featured }) => ($featured ? "38px" : "32px")};
    height: ${({ $featured }) => ($featured ? "38px" : "32px")};
    flex: 0 0 ${({ $featured }) => ($featured ? "38px" : "32px")};
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
    border-color: var(--porty-primary);
    background: ${({ $isDark }) => ($isDark ? "#223A2F" : "#F7FBF8")};
  }

  @media (max-width: 480px) {
    min-height: ${({ $featured }) => ($featured ? "82px" : "66px")};

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
  padding: 14px 24px max(15px, env(safe-area-inset-bottom));
  border-top: 1px solid
    ${({ $isDark }) => ($isDark ? "#34413A" : "#E1E9E3")};
  background: ${({ $isDark }) =>
    $isDark ? "rgba(29, 37, 33, 0.96)" : "rgba(255, 254, 250, 0.94)"};
  backdrop-filter: blur(20px);
  z-index: 25;

  @media (max-width: 768px) {
    padding: 12px 14px max(12px, env(safe-area-inset-bottom));
  }
`;

export const InputWrapper = styled.div`
  width: min(100%, 820px);
  min-height: 60px;
  margin: 0 auto;
  padding: 7px 8px 7px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid
    ${({ $isDark }) => ($isDark ? "#3A443F" : "#D6E1DC")};
  border-radius: 16px;
  background: ${({ $isDark }) => ($isDark ? "#252E29" : "#F7FAF7")};
  transition: border-color 160ms ease;

  &:focus-within {
    border-color: var(--porty-primary);
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
`;

export const SendButton = styled.button`
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 14px;
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
  background:
    radial-gradient(circle at 50% 38%, #fffefa 0, #eff9f3 48%, #e7f3ec 100%);
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
  height: 88px;
  margin-bottom: 6px;
  padding: 7px;
  border: 3px solid #ffffff;
  border-radius: 28px 28px 28px 10px;
  background: var(--porty-accent-soft);
  box-shadow: 0 15px 32px rgba(71, 112, 89, 0.14);
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
