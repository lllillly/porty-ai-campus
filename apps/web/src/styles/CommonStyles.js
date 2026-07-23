import styled from "styled-components";

/* ✅ 공통 카드 스타일 (AI 응답 카드 전용) */
export const CommonCard = styled.div`
  background: #fff;
  border: 1px solid #9dabcF;
  border-radius: 12px;
  width: 90%;
  max-width: 320px;
  padding: 1rem;
  margin: 0.5rem 0 0.5rem 2.5rem; /* AI 말풍선처럼 왼쪽 정렬 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  @media (max-width: 480px) {
    width: 92%;
    padding: 0.9rem;
  }
`;

/* ✅ 공통 버튼 스타일 */
export const PrimaryButton = styled.button`
  background: #9dabcF;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    background: #8a9bc5;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/* ✅ 공통 “메인으로 돌아가기” 버튼 */
export const BackButton = styled(PrimaryButton)`
  background: #fff;
  color: #9dabcF;
  border: 1.5px solid #9dabcF;
  margin-top: 0.5rem;

  &:hover {
    background: #9dabcF;
    color: #fff;
  }
`;

/* ✅ 공통 제목 스타일 */
export const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #414756;
  margin: 0;
`;

/* ✅ 공통 설명 텍스트 */
export const Text = styled.p`
  font-size: 0.85rem;
  color: #414756;
  margin: 0.3rem 0;
`;

/* ✅ 페이지 전체 스크롤 완전 차단용 글로벌 래퍼 */
export const PageWrapper = styled.div`
  height: 100vh;
  overflow: hidden;        /* 🔥 페이지 스크롤 완전 차단 */
  width: 100vw;

  /* 모바일 사파리 vh 버그 방지를 위해 추가 */
  position: fixed;
  top: 0;
  left: 0;
`;
