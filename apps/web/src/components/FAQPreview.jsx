import React from "react";
import styled from "styled-components";
// 질문 그나마 답변 잘나오는거 말해주시면 수정할게요 말해주셈~
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
    // 검색어로 FAQ 필터링
    const getFilteredFAQs = () => {
        if (!searchTerm || !searchTerm.trim()) {
            // 검색어 없으면 전체 표시
            return FAQ_LIST;
        }

        const lowerSearchTerm = searchTerm.toLowerCase().trim();

        return FAQ_LIST.filter((faq) => {
            // 질문 텍스트에 검색어가 포함되어 있는지 확인이요
            if (faq.question.toLowerCase().includes(lowerSearchTerm)) {
                return true;
            }

            // 키워드 중 하나라도 검색어에 포함되어 있는지 확인
            return faq.keywords.some((keyword) =>
                lowerSearchTerm.includes(keyword) || keyword.includes(lowerSearchTerm)
            );
        });
    };

    const filteredFAQs = getFilteredFAQs();

    // 항상 표시 (검색어가 있어도 전체 또는 필터링된 결과 표시)
    return (
        <FAQContainer onClick={(e) => e.stopPropagation()}>
            <FAQHeader>
                <FAQTitle>
                    {filteredFAQs.length === FAQ_LIST.length
                        ? "💡 자주 묻는 질문"
                        : `🔍 검색 결과 (${filteredFAQs.length}개)`}
                </FAQTitle>
                <CloseButton onClick={onClose}>✕</CloseButton>
            </FAQHeader>
            <FAQList>
                {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((faq) => (
                        <FAQItem
                            key={faq.id}
                            onMouseDown={(e) => {
                                e.preventDefault(); // blur 이벤트 방지
                                onSelect(faq.question);
                            }}
                        >
                            <QuestionIcon>❓</QuestionIcon>
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
    bottom: 11%;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    border-radius: 16px 16px 0 0;
    padding: 1rem;
    margin-bottom: 0.5rem;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
    animation: slideUp 0.2s ease-out;
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
        padding: 0.85rem;
        margin-bottom: 0.35rem;
    }
`;

const FAQHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #EAEFFF;
`;

const FAQTitle = styled.h3`
    font-size: 0.95rem;
    font-weight: 600;
    color: #414756;
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

    @media (max-width: 768px) {
        font-size: 0.9rem;
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #999;
    cursor: pointer;
    padding: 0.25rem;
    transition: color 0.2s ease;

    &:hover {
        color: #414756;
    }

    @media (max-width: 768px) {
        font-size: 1.1rem;
    }
`;

const FAQList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 250px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #9DABCF;
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
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: #EAEFFF;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

    &:hover {
        background: #9DABCF;
        transform: translateX(4px);

        span {
            color: white;
        }
    }

    &:active {
        transform: translateX(2px);
    }

    @media (max-width: 768px) {
        padding: 0.65rem 0.85rem;
        gap: 0.6rem;
    }
`;

const QuestionIcon = styled.div`
    font-size: 1.2rem;
    flex-shrink: 0;

    @media (max-width: 768px) {
        font-size: 1.1rem;
    }
`;

const QuestionText = styled.span`
    font-size: 0.9rem;
    color: #414756;
    line-height: 1.4;
    transition: color 0.2s ease;

    @media (max-width: 768px) {
        font-size: 0.85rem;
    }
`;

const NoResult = styled.div`
    padding: 1.5rem;
    text-align: center;
    color: #999;
    font-size: 0.9rem;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export default FAQPreview;