import styled from "styled-components";

export const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(35, 43, 39, 0.38);
  backdrop-filter: blur(5px);

  @media (max-width: 560px) {
    align-items: flex-end;
    padding: 0;
  }
`;

export const ModalContainer = styled.section`
  width: min(100%, 420px);
  max-height: calc(100dvh - 40px);
  overflow-y: auto;
  padding: 24px;
  border: 0;
  border-radius: 28px;
  background: var(--porty-surface);
  box-shadow: 0 24px 64px rgba(43, 58, 51, 0.16);
  color: var(--porty-text);
  animation: popIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1);

  @keyframes popIn {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: 560px) {
    width: 100%;
    max-height: calc(100dvh - 32px);
    padding: 22px 20px max(22px, env(safe-area-inset-bottom));
    border-right: 0;
    border-bottom: 0;
    border-left: 0;
    border-radius: 24px 24px 0 0;
    animation-name: sheetIn;
  }

  @keyframes sheetIn {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const ModalTitle = styled.h2`
  margin: 0 0 20px;
  color: var(--porty-text);
  font-size: 19px;
  font-weight: 750;
  letter-spacing: -0.025em;
`;

export const Label = styled.label`
  display: block;
  margin: 16px 0 7px;
  color: var(--porty-text);
  font-size: 13px;
  font-weight: 700;
`;

export const Select = styled.select`
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid var(--porty-border);
  border-radius: 13px;
  background: var(--porty-surface-soft);
  color: var(--porty-text);
  font-size: 15px;
  cursor: pointer;

  &:focus {
    border-color: var(--porty-primary);
    outline: 3px solid rgba(8, 184, 106, 0.15);
  }
`;

export const ToggleRow = styled.div`
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: var(--porty-subtext);
  font-size: 14px;
`;

export const ToggleSwitch = styled.input`
  width: 50px;
  height: 28px;
  flex: 0 0 50px;
  margin: 0;
  appearance: none;
  position: relative;
  border-radius: 999px;
  background: #b8c1bc;
  cursor: pointer;
  transition: background 180ms ease;

  &:checked {
    background: var(--porty-primary);
  }

  &::before {
    width: 24px;
    height: 24px;
    position: absolute;
    top: 2px;
    left: 2px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.16);
    content: "";
    transition: transform 180ms ease;
  }

  &:checked::before {
    transform: translateX(22px);
  }
`;

export const SaveButton = styled.button`
  width: 100%;
  min-height: 48px;
  margin-top: 22px;
  padding: 11px 16px;
  border: 0;
  border-radius: 16px;
  background: var(--porty-primary);
  color: #10251a;
  font-size: 14px;
  font-weight: 750;
  cursor: pointer;

  &:hover {
    background: var(--porty-primary-hover);
    color: white;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const DeleteButton = styled.button`
  width: 100%;
  min-height: 44px;
  margin-top: 8px;
  padding: 10px 16px;
  border: 0;
  border-radius: 16px;
  background: var(--porty-surface-soft);
  color: var(--porty-subtext);
  font-size: 14px;
  font-weight: 650;
  cursor: pointer;

  &:hover {
    color: #d53f45;
    border-color: rgba(229, 72, 77, 0.32);
    background: rgba(229, 72, 77, 0.08);
  }
`;
