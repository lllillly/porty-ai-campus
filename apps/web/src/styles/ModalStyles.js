import styled from "styled-components";

/* 전체 백드롭 */
export const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
`;

/* 모달 */
export const ModalContainer = styled.div`
  width: 92%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 1.6rem 1.4rem;
  box-shadow: 0 6px 20px rgba(0,0,0,0.18);
  animation: popIn 0.28s ease;

  @keyframes popIn {
    0% { opacity: 0; transform: translateY(10px) scale(0.95); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 480px) {
    width: 94%;
    padding: 1.35rem 1.2rem;
  }
`;

/* 제목 */
export const ModalTitle = styled.h2`
  text-align: center;
  font-size: 1.35rem;
  font-weight: 700;
  color: #414756;
  margin-bottom: 1.4rem;
`;

/* 라벨 */
export const Label = styled.label`
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #414756;
  margin-bottom: 0.45rem;
  margin-top: 0.8rem;
`;

/* 드롭다운 */
export const Select = styled.select`
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 1.4px solid #d5d9e2;
  background: #f9fbff;
  font-size: 1rem;
  color: #333;

  transition: all 0.2s ease;
  cursor: pointer;

  &:focus {
    border-color: #9DABCF;
    outline: none;
    background-color: #fff;
  }

  @media (max-width: 480px) {
    padding: 0.78rem 0.9rem;
    font-size: 0.96rem;
  }
`;

/* ON/OFF 스위치 행 */
export const ToggleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

/* 스위치 */
export const ToggleSwitch = styled.input`
  width: 50px;
  height: 26px;
  appearance: none;
  background: #d0d0d0;
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: 0.25s;

  &:checked {
    background: #9DABCF;
  }

  &::before {
    content: "";
    position: absolute;
    width: 22px;
    height: 22px;
    left: 2px;
    top: 2px;
    border-radius: 50%;
    background: white;
    transition: transform 0.25s;
  }

  &:checked::before {
    transform: translateX(24px);
  }
`;

/* 저장 버튼 */
export const SaveButton = styled.button`
  width: 100%;
  padding: 0.85rem 0;
  border: none;
  border-radius: 12px;
  background: #9DABCF;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  margin-top: 1.4rem;
  cursor: pointer;
  transition: 0.22s;

  &:hover {
    background: #8ea0c7;
  }
`;

/* 삭제 버튼 */
export const DeleteButton = styled.button`
  width: 100%;
  padding: 0.8rem 0;
  border: none;
  border-radius: 12px;
  background: #ececec;
  color: #444;
  font-size: 0.96rem;
  margin-top: 0.5rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #e0e0e0;
  }
`;
