import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ExternalLink, Home } from "react-feather";
import { getMealStatus } from "../api/contentApi";
import { BackButton, CardTitle, CommonCard, Text } from "../styles/CommonStyles";

const DietCard = ({ campus, place, dorm, onBackToMain }) => {
  const [state, setState] = useState({ status: "loading", meals: [] });

  useEffect(() => {
    let active = true;

    getMealStatus({ campus, place, dorm: place === "기숙사" ? dorm : "" })
      .then((result) => {
        if (active) {
          setState({
            status: result.status,
            message: result.message,
            meals: result.meals || [],
          });
        }
      })
      .catch(() => {
        if (active) {
          setState({ status: "error", meals: [] });
        }
      });

    return () => {
      active = false;
    };
  }, [campus, place, dorm]);

  const title =
    place === "기숙사" ? `${campus} ${dorm}` : `${campus} 학생식당`;

  return (
    <Card>
      <Header>
        <CardTitle>{title}</CardTitle>
        <StatusBadge $active={state.meals.length > 0}>
          {state.meals.length > 0 ? "연동됨" : "연동 준비 중"}
        </StatusBadge>
      </Header>

      {state.status === "loading" && <Text>식단 연동 상태를 확인하고 있어요.</Text>}
      {state.status === "error" && (
        <Notice>AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.</Notice>
      )}
      {state.status !== "loading" &&
        state.status !== "error" &&
        state.meals.length === 0 && (
          <Notice>
            {state.message ||
              "정확한 실시간 식단을 제공하기 위한 데이터 연동을 준비 중입니다."}
          </Notice>
        )}

      {state.meals.map((meal) => (
        <MealSection key={`${meal.date}-${meal.type}`}>
          <strong>{meal.type}</strong>
          <span>{meal.menu}</span>
        </MealSection>
      ))}

      <OfficialLink
        href="https://www.kongju.ac.kr/KNU/16863/subview.do"
        target="_blank"
        rel="noreferrer"
      >
        오늘의 공식 식단 확인 <ExternalLink size={14} />
      </OfficialLink>

      <BackButton onClick={onBackToMain}>
        <Home size={15} /> 메인으로
      </BackButton>
    </Card>
  );
};

const Card = styled(CommonCard)`
  max-width: 380px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
`;

const StatusBadge = styled.span`
  flex: none;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: ${({ $active }) => ($active ? "#e7f8ed" : "#fff4d8")};
  color: ${({ $active }) => ($active ? "#267a45" : "#8a6410")};
  font-size: 0.7rem;
  font-weight: 700;
`;

const Notice = styled(Text)`
  padding: 0.75rem;
  border-radius: 8px;
  background: #f5f7ff;
  line-height: 1.55;
`;

const MealSection = styled.div`
  display: grid;
  gap: 0.25rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: #f5f7ff;
  color: #414756;
  font-size: 0.82rem;
`;

const OfficialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  margin-top: 0.8rem;
  color: #6879ad;
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
`;

export default DietCard;
