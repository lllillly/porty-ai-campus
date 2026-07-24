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
            sourceUrl: result.source_url,
            fetchedAt: result.fetched_at,
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
          {state.meals.length > 0
            ? "실시간"
            : state.status === "no-menu"
              ? "등록 없음"
              : "연결 확인 중"}
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
        <MealSection key={`${meal.restaurant}-${meal.date}-${meal.type}`}>
          <strong>
            {meal.restaurant} · {meal.type}
          </strong>
          <span>{meal.menu}</span>
        </MealSection>
      ))}

      {state.fetchedAt && (
        <FetchedAt>
          {new Date(state.fetchedAt).toLocaleString("ko-KR")} 기준 조회
        </FetchedAt>
      )}

      <OfficialLink
        href={
          state.sourceUrl ||
          "https://www.kongju.ac.kr/KNU/16863/subview.do"
        }
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
  background: ${({ $active }) => ($active ? "var(--porty-primary-soft)" : "#fff5d6")};
  color: ${({ $active }) => ($active ? "var(--porty-primary-hover)" : "#7a5810")};
  font-size: 0.7rem;
  font-weight: 700;
`;

const Notice = styled(Text)`
  padding: 0.75rem;
  border-radius: 11px;
  background: var(--porty-surface-soft);
  line-height: 1.55;
`;

const MealSection = styled.div`
  display: grid;
  gap: 0.25rem;
  padding: 0.75rem;
  border-radius: 11px;
  background: var(--porty-surface-soft);
  color: var(--porty-text);
  font-size: 0.82rem;
`;

const FetchedAt = styled.p`
  margin: 0.65rem 0 0;
  color: var(--porty-text-muted);
  font-size: 0.7rem;
  text-align: right;
`;

const OfficialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  margin-top: 0.8rem;
  color: var(--porty-primary-hover);
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
`;

export default DietCard;
