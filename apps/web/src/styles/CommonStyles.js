import styled from "styled-components";

export const CommonCard = styled.article`
  width: min(calc(100% - 48px), 390px);
  margin: 2px 0 2px 48px;
  padding: 18px;
  border: 1px solid var(--porty-border);
  border-radius: 22px 22px 22px 8px;
  background: var(--porty-surface);
  box-shadow: var(--porty-shadow);
  color: var(--porty-text);

  @media (max-width: 480px) {
    width: calc(100% - 48px);
    padding: 16px;
  }
`;

export const PrimaryButton = styled.button`
  width: 100%;
  min-height: 44px;
  padding: 10px 16px;
  border: 0;
  border-radius: 13px;
  background: var(--porty-primary);
  color: #173c2d;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 160ms ease,
    transform 160ms ease;

  &:hover {
    background: var(--porty-primary-hover);
    color: #ffffff;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }
`;

export const BackButton = styled(PrimaryButton)`
  margin-top: 10px;
  border: 1px solid var(--porty-border);
  background: var(--porty-surface);
  color: var(--porty-subtext);

  &:hover {
    border-color: var(--porty-primary);
    background: var(--porty-primary-soft);
    color: var(--porty-text);
  }

  svg {
    vertical-align: -2px;
  }
`;

export const CardTitle = styled.h3`
  margin: 0;
  color: var(--porty-text);
  font-size: 15px;
  font-weight: 750;
  letter-spacing: -0.02em;
`;

export const Text = styled.p`
  margin: 5px 0;
  color: var(--porty-subtext);
  font-size: 13px;
  line-height: 1.55;
`;

export const PageWrapper = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
`;
