import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  getAuthUser,
  sendMagicLink,
  signOut,
} from "../api/authApi";
import {
  DeleteButton,
  Label,
  ModalBackdrop,
  ModalContainer,
  ModalTitle,
  SaveButton,
  ToggleRow,
  ToggleSwitch,
} from "../styles/ModalStyles";

const SettingsModal = ({ isDarkMode, onToggleDarkMode, onClose }) => {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [authConfigured, setAuthConfigured] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    getAuthUser()
      .then(({ configured, user: currentUser }) => {
        if (active) {
          setAuthConfigured(configured);
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (active) {
          setAuthConfigured(false);
          setUser(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async () => {
    if (!email.trim()) {
      setAuthMessage("이메일을 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    setAuthMessage("");
    try {
      await sendMagicLink(email.trim());
      setAuthMessage("로그인 링크를 보냈습니다. 이메일을 확인해 주세요.");
    } catch {
      setAuthMessage("로그인 링크를 보내지 못했습니다. Supabase 설정을 확인해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setAuthMessage("로그아웃했습니다.");
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer onClick={(event) => event.stopPropagation()}>
        <ModalTitle>PORTY 설정</ModalTitle>

        <Label>화면</Label>
        <ToggleRow>
          <span>다크 모드 {isDarkMode ? "ON" : "OFF"}</span>
          <ToggleSwitch
            type="checkbox"
            checked={isDarkMode}
            onChange={onToggleDarkMode}
          />
        </ToggleRow>

        <Divider />
        <Label>대화 저장</Label>
        {!authConfigured ? (
          <Helper>
            Supabase 환경변수를 연결하면 로그인과 대화 기록 저장을 사용할 수
            있습니다.
          </Helper>
        ) : user ? (
          <>
            <Helper>
              <strong>{user.email}</strong> 계정으로 대화를 안전하게 저장하고
              있습니다.
            </Helper>
            <DeleteButton type="button" onClick={handleLogout}>
              로그아웃
            </DeleteButton>
          </>
        ) : (
          <>
            <EmailInput
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleLogin()}
              placeholder="name@example.com"
              autoComplete="email"
            />
            <SaveButton
              type="button"
              onClick={handleLogin}
              disabled={submitting}
            >
              {submitting ? "전송 중..." : "이메일로 로그인"}
            </SaveButton>
          </>
        )}

        {authMessage && <AuthMessage>{authMessage}</AuthMessage>}
        <CloseButton type="button" onClick={onClose}>
          닫기
        </CloseButton>
      </ModalContainer>
    </ModalBackdrop>
  );
};

const Divider = styled.hr`
  margin: 1.2rem 0;
  border: 0;
  border-top: 1px solid #eef0f6;
`;

const Helper = styled.p`
  margin: 0.4rem 0 0;
  color: #687086;
  font-size: 0.84rem;
  line-height: 1.55;
`;

const EmailInput = styled.input`
  width: 100%;
  margin-top: 0.45rem;
  padding: 0.8rem 0.9rem;
  border: 1px solid #d5d9e2;
  border-radius: 10px;
  box-sizing: border-box;
  color: #414756;
  font-size: 0.95rem;

  &:focus {
    border-color: #9dabcf;
    outline: 2px solid #eaefff;
  }
`;

const AuthMessage = styled.p`
  margin: 0.7rem 0 0;
  color: #6879ad;
  font-size: 0.8rem;
  line-height: 1.45;
`;

const CloseButton = styled.button`
  width: 100%;
  margin-top: 0.7rem;
  padding: 0.7rem;
  border: 0;
  background: transparent;
  color: #687086;
  cursor: pointer;
`;

export default SettingsModal;
