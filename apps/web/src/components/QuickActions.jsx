import React from "react";
import {
  BookOpen,
  Calendar,
  Coffee,
  MapPin,
  MessageCircle,
} from "react-feather";
import { QuickActionsWrapper, QuickActionButton } from "../styles/ChatPage.styles";

const QuickActions = ({ onActionClick, hasDietSettings, isDark }) => {
    const baseActions = [
        {
            id: 1,
            label: "학사일정",
            description: "달력으로 보기",
            message: "학사 일정",
            icon: Calendar,
        },
        {
            id: 2,
            label: "학생소식",
            description: "새 글 3개",
            message: "최근 학생소식 3개 보여줘",
            icon: MessageCircle,
        },
        {
            id: 3,
            label: "캠퍼스",
            description: "주소와 위치",
            message: "찾아오시는 길",
            icon: MapPin,
        },
        {
            id: 4,
            label: "수강신청",
            description: "방법 확인",
            message: "수강신청",
            icon: BookOpen,
        },
    ];

    const actions = hasDietSettings
        ? [
            ...baseActions,
            {
                id: 5,
                label: "오늘의 식단",
                description: "설정한 식당",
                message: "식단표 보기",
                icon: Coffee,
            },
        ]
        : baseActions;

    return (
        <QuickActionsWrapper>
            {actions.map((action) => {
                const Icon = action.icon;
                return (
                <QuickActionButton
                    key={action.id}
                    $isDark={isDark}
                    onClick={() => onActionClick(action.message)}
                >
                    <span><Icon size={16} /></span>
                    <div>
                        <strong>{action.label}</strong>
                        <small>{action.description}</small>
                    </div>
                </QuickActionButton>
                );
            })}
        </QuickActionsWrapper>
    );
};

export default QuickActions;
