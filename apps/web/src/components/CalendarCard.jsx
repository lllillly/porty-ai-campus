import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ExternalLink, Home } from "react-feather";
import { getScheduleReference } from "../api/contentApi";
import { BackButton, CardTitle, CommonCard, Text } from "../styles/CommonStyles";

const CalendarCard = ({ onBackToMain }) => {
  const [state, setState] = useState({ status: "loading", sources: [] });

  useEffect(() => {
    let active = true;

    getScheduleReference()
      .then((result) => {
        if (active) {
          setState({
            status: "ready",
            message: result.message,
            sources: result.sources || [],
          });
        }
      })
      .catch(() => {
        if (active) {
          setState({ status: "error", sources: [] });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Card>
      <Header>
        <CardTitle>학사 일정 자료</CardTitle>
        <ReferenceBadge>참고용</ReferenceBadge>
      </Header>

      {state.status === "loading" && <Text>학사 자료를 찾고 있어요.</Text>}
      {state.status === "error" && (
        <Notice>AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.</Notice>
      )}
      {state.status === "ready" && (
        <>
          <Notice>{state.message}</Notice>
          <SourceList>
            {state.sources.map((source, index) => (
              <SourceItem key={`${source.title}-${index}`}>
                <strong>{source.title || source.category}</strong>
                <span>{source.snippet}</span>
              </SourceItem>
            ))}
          </SourceList>
          <OfficialLink
            href="https://www.kongju.ac.kr/KNU/16834/subview.do"
            target="_blank"
            rel="noreferrer"
          >
            최신 학사일정 확인 <ExternalLink size={14} />
          </OfficialLink>
        </>
      )}

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
  margin-bottom: 0.7rem;
`;

const ReferenceBadge = styled.span`
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: #fff5d6;
  color: #7a5810;
  font-size: 0.72rem;
  font-weight: 700;
`;

const Notice = styled(Text)`
  padding: 0.65rem;
  border-radius: 11px;
  background: var(--porty-surface-soft);
  line-height: 1.5;
`;

const SourceList = styled.div`
  max-height: 210px;
  margin-top: 0.65rem;
  overflow-y: auto;
`;

const SourceItem = styled.div`
  display: grid;
  gap: 0.25rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--porty-border);

  strong {
    color: var(--porty-text);
    font-size: 0.82rem;
  }

  span {
    display: -webkit-box;
    overflow: hidden;
    color: var(--porty-subtext);
    font-size: 0.78rem;
    line-height: 1.45;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }
`;

const OfficialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  margin-top: 0.7rem;
  color: var(--porty-primary-hover);
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
`;

export default CalendarCard;
