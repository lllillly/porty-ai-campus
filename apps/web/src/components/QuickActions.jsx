import React from "react";
import {
  BookOpen,
  Calendar,
  Coffee,
  MapPin,
  MessageCircle,
  Truck,
} from "react-feather";
import { QuickActionsWrapper, QuickActionButton } from "../styles/ChatPage.styles";

const QuickActions = ({
  onActionClick,
  onDietSetup,
  hasDietSettings,
  isDark,
  featured = false,
}) => {
  const actions = [
    {
      id: 1,
      label: "학사일정",
      description: "이번 달 일정을 달력으로",
      message: "학사 일정",
      icon: Calendar,
    },
    {
      id: 2,
      label: "학생소식",
      description: "새로 올라온 소식 3개",
      message: "최근 학생소식 3개 보여줘",
      icon: MessageCircle,
    },
    {
      id: 3,
      label: "캠퍼스 위치",
      description: "건물 주소와 위치 찾기",
      message: "찾아오시는 길",
      icon: MapPin,
    },
    {
      id: 4,
      label: "수강신청",
      description: "신청 방법 빠르게 확인",
      message: "수강신청",
      icon: BookOpen,
    },
    {
      id: 5,
      label: "순환버스",
      description: "정류장별 시간표 확인",
      message: "순환버스 시간표 알려줘",
      icon: Truck,
    },
    {
      id: 6,
      label: "오늘의 식단",
      description: hasDietSettings
        ? "설정한 식당 메뉴 보기"
        : "자주 가는 식당 설정하기",
      message: "식단표 보기",
      icon: Coffee,
    },
  ];

  return (
    <QuickActionsWrapper $featured={featured}>
      {actions.map((action) => {
        const Icon = action.icon;
        const handleClick = () => {
          if (action.id === 6 && !hasDietSettings && onDietSetup) {
            onDietSetup();
            return;
          }
          onActionClick(action.message);
        };

        return (
          <QuickActionButton
            key={action.id}
            $isDark={isDark}
            $featured={featured}
            onClick={handleClick}
          >
            <span>
              <Icon size={16} />
            </span>
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
