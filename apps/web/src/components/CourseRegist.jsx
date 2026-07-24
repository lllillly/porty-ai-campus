import React from "react";
import { BookOpen, ExternalLink, Home } from "react-feather";
import styled from "styled-components";

import {
  BackButton,
  CardTitle,
  CommonCard,
} from "../styles/CommonStyles";

const COURSE_REGISTRATION_URL = "https://sugang.kongju.ac.kr/";

const CourseRegist = ({ onBackToMain }) => (
  <Card>
    <Header>
      <BookOpen size={18} />
      <CardTitle>수강신청 매뉴얼</CardTitle>
    </Header>

    <Section>
      <SubTitle>수강신청 바로가기</SubTitle>
      <PrimaryLink
        href={COURSE_REGISTRATION_URL}
        target="_blank"
        rel="noreferrer"
      >
        <ExternalLink size={15} /> 수강신청 페이지 이동
      </PrimaryLink>
    </Section>

    <Section>
      <SubTitle>신청 전 확인사항</SubTitle>
      <ul>
        <li>수강신청 기간은 학사공지에서 확인해 주세요.</li>
        <li>
          수강정정 기간에는 <strong>삭제 및 변경</strong>이 가능합니다.
        </li>
        <li>모바일 환경에서는 일부 기능이 제한될 수 있습니다.</li>
        <li>
          접속 오류가 발생하면 브라우저를 <strong>새로고침</strong>한 뒤 다시
          시도해 주세요.
        </li>
      </ul>
    </Section>

    <BackButton onClick={onBackToMain}>
      <Home size={15} /> 메인으로
    </BackButton>
  </Card>
);

const Card = styled(CommonCard)`
  padding-bottom: 0.8rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.4rem;
  color: var(--porty-primary-hover);
`;

const Section = styled.section`
  margin-top: 0.5rem;
  padding: 0.6rem 0.7rem;
  border-radius: 12px;
  background: var(--porty-surface-soft);
  font-size: 0.85rem;

  ul {
    margin: 0.3rem 0 0;
    padding-left: 1rem;
  }

  li {
    margin-bottom: 0.25rem;
    line-height: 1.4;
  }
`;

const SubTitle = styled.h3`
  margin: 0 0 0.3rem;
  color: var(--porty-text);
  font-size: 0.9rem;
  font-weight: 650;
`;

const PrimaryLink = styled.a`
  width: 100%;
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0.55rem 0.9rem;
  border-radius: 10px;
  background: var(--porty-primary);
  color: #10251a;
  font-size: 0.8rem;
  font-weight: 650;
  text-decoration: none;
  transition:
    background 160ms ease,
    color 160ms ease;

  &:hover {
    background: var(--porty-primary-hover);
    color: #ffffff;
  }
`;

export default CourseRegist;
