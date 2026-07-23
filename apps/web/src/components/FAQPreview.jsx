import React from "react";
import styled from "styled-components";
import { HelpCircle, Search, X } from "react-feather";

const FAQ_LIST = [
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
        question: "셔틀버스 시간 노선이 어떻게 되나요?",
        keywords: ["셔틀버스", "시간", "노선", "셔틀", "버스"],
    },
    {
        id: 4,
        question: "공주대학교에 대해 알려주세요",
        keywords: ["공주대", "공주대학교", "공주대학교설명", "설명", "공주대설명"],
    },
    {
        id: 5,
        question: "통학버스 시간표 알려줘",
        keywords: ["통학", "버스", "시간표", "셔틀", "교통"],
    },
];

const FAQPreview = ({ searchTerm, onSelect, onClose }) => {
    const getFilteredFAQs = () => {
        if (!searchTerm || !searchTerm.trim()) {
            return FAQ_LIST;
        }

        const lowerSearchTerm = searchTerm.toLowerCase().trim();

        return FAQ_LIST.filter((faq) => {
            if (faq.question.toLowerCase().includes(lowerSearchTerm)) {
                return true;
            }

            return faq.keywords.some((keyword) =>
                lowerSearchTerm.includes(keyword) || keyword.includes(lowerSearchTerm)
            );
        });
    };

    const filteredFAQs = getFilteredFAQs();

    return (
        <FAQContainer onClick={(e) => e.stopPropagation()}>
            <FAQHeader>
                <FAQTitle>
                    {filteredFAQs.length === FAQ_LIST.length
                        ? <HelpCircle size={17} />
                        : <Search size={17} />}
                    {filteredFAQs.length === FAQ_LIST.length
                        ? "자주 묻는 질문"
                        : `검색 결과 ${filteredFAQs.length}개`}
                </FAQTitle>
                <CloseButton onClick={onClose} aria-label="추천 질문 닫기">
                    <X size={19} />
                </CloseButton>
            </FAQHeader>
            <FAQList>
                {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((faq) => (
                        <FAQItem
                            key={faq.id}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                onSelect(faq.question);
                            }}
                        >
                            <QuestionIcon>Q</QuestionIcon>
                            <QuestionText>{faq.question}</QuestionText>
                        </FAQItem>
                    ))
                ) : (
                    <NoResult>검색 결과가 없습니다</NoResult>
                )}
            </FAQList>
        </FAQContainer>
    );
};

const FAQContainer = styled.div`
    position: absolute;
    right: 24px;
    bottom: 90px;
    left: 24px;
    width: min(calc(100% - 48px), 820px);
    margin: 0 auto;
    padding: 14px;
    border: 1px solid var(--porty-border);
    border-radius: 18px;
    background: color-mix(in srgb, var(--porty-surface) 96%, transparent);
    box-shadow: 0 18px 48px rgba(19, 43, 32, 0.16);
    backdrop-filter: blur(16px);
    animation: slideUp 180ms ease-out;
    z-index: 200;


    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (max-width: 768px) {
        right: 14px;
        bottom: 78px;
        left: 14px;
        width: calc(100% - 28px);
        padding: 12px;
    }
`;

const FAQHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding: 0 2px 8px;
    border-bottom: 1px solid var(--porty-border);
`;

const FAQTitle = styled.h3`
    margin: 0;
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--porty-text);
    font-size: 14px;
    font-weight: 700;

    svg {
        color: var(--porty-primary);
    }
`;

const CloseButton = styled.button`
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: var(--porty-subtext);
    cursor: pointer;

    &:hover {
        background: var(--porty-surface-soft);
        color: var(--porty-text);
    }
`;

const FAQList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 250px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: var(--porty-primary);
        border-radius: 2px;
    }

    @media (max-width: 768px) {
        max-height: 200px;
        gap: 0.4rem;
    }
`;

const FAQItem = styled.button`
    display: flex;
    align-items: center;
    min-height: 46px;
    gap: 10px;
    padding: 9px 11px;
    border: 1px solid transparent;
    border-radius: 13px;
    background: var(--porty-surface-soft);
    cursor: pointer;
    transition: all 160ms ease;
    text-align: left;

    &:hover {
        border-color: var(--porty-primary);
        background: var(--porty-primary-soft);
    }

    &:active {
        transform: scale(0.99);
    }
`;

const QuestionIcon = styled.div`
    width: 26px;
    height: 26px;
    flex: 0 0 26px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: var(--porty-primary-soft);
    color: var(--porty-primary-hover);
    font-size: 12px;
    font-weight: 800;
`;

const QuestionText = styled.span`
    color: var(--porty-text);
    font-size: 13px;
    font-weight: 550;
    line-height: 1.4;
`;

const NoResult = styled.div`
    padding: 1.5rem;
    text-align: center;
    color: var(--porty-subtext);
    font-size: 13px;
`;

export default FAQPreview;
