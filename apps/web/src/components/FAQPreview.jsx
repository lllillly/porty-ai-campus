import React from "react";
import { HelpCircle, Search, X } from "react-feather";
import styled from "styled-components";

export const FAQ_LIST = [
  {
    id: 1,
    question: "이번 달 학사일정 알려줘",
    keywords: ["학사", "일정", "스케줄", "달력", "캘린더"],
  },
  {
    id: 2,
    question: "도서관 운영시간이 어떻게 되나요?",
    keywords: ["도서관", "운영", "시간", "열람실", "공부"],
  },
  {
    id: 3,
    question: "순환버스 시간표 알려줘",
    keywords: ["순환버스", "셔틀버스", "시간", "노선", "버스"],
  },
  {
    id: 4,
    question: "최근 학생소식 3개 보여줘",
    keywords: ["학생소식", "공지", "학생공지", "최신글", "새소식"],
  },
  {
    id: 5,
    question: "중앙도서관이 어디야?",
    keywords: ["주소", "위치", "건물", "중앙도서관", "어디"],
  },
  {
    id: 6,
    question: "오늘 식단 알려줘",
    keywords: ["식단", "메뉴", "학식", "밥", "식당"],
  },
];

export const filterFAQs = (searchTerm) => {
  const term = searchTerm?.trim().toLowerCase();
  if (!term) return FAQ_LIST;

  return FAQ_LIST.filter(
    ({ question, keywords }) =>
      question.toLowerCase().includes(term) ||
      keywords.some(
        (keyword) => keyword.includes(term) || term.includes(keyword),
      ),
  );
};

const FAQPreview = ({ searchTerm, onSelect, onClose }) => {
  const filteredFAQs = filterFAQs(searchTerm);
  const isSearching = Boolean(searchTerm?.trim());

  return (
    <PreviewPanel id="porty-question-preview" aria-label="추천 질문">
      <PreviewHeader>
        <PreviewTitle>
          {isSearching ? <Search size={16} /> : <HelpCircle size={16} />}
          {isSearching
            ? `추천 질문 ${filteredFAQs.length}개`
            : "이런 질문은 어떠세요?"}
        </PreviewTitle>
        <CloseButton type="button" onClick={onClose} aria-label="추천 질문 닫기">
          <X size={18} />
        </CloseButton>
      </PreviewHeader>

      <QuestionList>
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((faq) => (
            <QuestionButton
              type="button"
              key={faq.id}
              onMouseDown={(event) => {
                event.preventDefault();
                onSelect(faq.question);
              }}
            >
              <QuestionMark aria-hidden="true">Q</QuestionMark>
              <span>{faq.question}</span>
            </QuestionButton>
          ))
        ) : (
          <NoResult>입력한 내용과 비슷한 추천 질문이 없어요.</NoResult>
        )}
      </QuestionList>
    </PreviewPanel>
  );
};

const PreviewPanel = styled.aside`
  position: absolute;
  right: 24px;
  bottom: 92px;
  left: 24px;
  width: min(calc(100% - 48px), 820px);
  margin: 0 auto;
  padding: 14px;
  border: 1px solid var(--porty-border);
  border-radius: 16px;
  background: var(--porty-surface);
  box-shadow: 0 12px 32px rgba(45, 67, 54, 0.1);
  animation: preview-in 180ms ease-out;
  z-index: 200;

  @keyframes preview-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    right: 14px;
    bottom: 80px;
    left: 14px;
    width: calc(100% - 28px);
    padding: 12px;
  }
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 1px 2px 9px 4px;
`;

const PreviewTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  color: var(--porty-text);
  font-size: 14px;
  font-weight: 750;
  letter-spacing: -0.02em;

  svg {
    color: var(--porty-primary-hover);
  }
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--porty-surface-soft);
  color: var(--porty-subtext);
  cursor: pointer;

  &:hover {
    background: var(--porty-primary-soft);
    color: var(--porty-text);
  }
`;

const QuestionList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
  max-height: 220px;
  overflow-y: auto;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    max-height: min(258px, 38vh);
  }
`;

const QuestionButton = styled.button`
  min-width: 0;
  min-height: 46px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  border: 1px solid var(--porty-border);
  border-radius: 11px;
  background: var(--porty-surface);
  color: var(--porty-text);
  cursor: pointer;
  text-align: left;
  transition:
    background 150ms ease,
    transform 150ms ease;

  &:hover {
    border-color: var(--porty-primary);
    background: var(--porty-primary-soft);
  }

  span:last-child {
    overflow: hidden;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const QuestionMark = styled.span`
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: transparent;
  color: var(--porty-primary-hover);
  font-size: 11px;
  font-weight: 800;
`;

const NoResult = styled.p`
  grid-column: 1 / -1;
  margin: 0;
  padding: 24px 12px;
  color: var(--porty-subtext);
  font-size: 13px;
  text-align: center;
`;

export default FAQPreview;
