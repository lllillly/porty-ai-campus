import React from "react";
import { QuickActionsWrapper, QuickActionButton } from "../styles/ChatPage.styles";

const QuickActions = ({ onActionClick, hasDietSettings }) => {
    const baseActions = [
        { id: 1, label: "학사 일정", message: "학사 일정" },
        { id: 2, label: "찾아오시는 길", message: "찾아오시는 길" },
        { id: 3, label: "수강신청", message: "수강신청" },
    ];

    // 식단 설정이 있으면 식단표 보기 버튼이 뜸
    const actions = hasDietSettings
        ? [...baseActions, { id: 4, label: "식단표 보기", message: "식단표 보기" }]
        : baseActions;

    return (
        <QuickActionsWrapper>
            {actions.map((action) => (
                <QuickActionButton
                    key={action.id}
                    onClick={() => onActionClick(action.message)}
                >
                    {action.label}
                </QuickActionButton>
            ))}
        </QuickActionsWrapper>
    );
};

export default QuickActions;