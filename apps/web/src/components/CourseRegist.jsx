import React from "react";
import styled from "styled-components";
import { ExternalLink, BookOpen, Home } from "react-feather";
import { CommonCard, BackButton, CardTitle} from "../styles/CommonStyles";

// ✅ API: POST /api/shortcut?type=수강신청 - 바로가기 처리
const CourseRegist = ({ onBackToMain }) => {
    const handleClick = () =>
        window.open("https://sugang.kongju.ac.kr/", "_blank");

    return (
        <Card>
            <Header>
                <BookOpen size={18} />
                <CardTitle>수강신청 메뉴얼</CardTitle>
            </Header>

            <Section>
                <SubTitle>🎓 수강신청 바로가기</SubTitle>
                <PrimaryButton onClick={handleClick}>
                    <ExternalLink size={15} /> 수강신청 페이지 이동
                </PrimaryButton>
            </Section>

            <Section>
                <SubTitle>⚠️ 유의사항</SubTitle>
                <ul>
                    <li>수강신청 기간은 학사공지에서 확인하세요.</li>
                    <li>수강정정 기간에는 <b>삭제 및 변경</b>이 가능합니다.</li>
                    <li>모바일 환경에서는 일부 기능이 제한될 수 있습니다.</li>
                    <li>접속 오류 시 브라우저 <b>새로고침(F5)</b> 후 재시도하세요.</li>
                </ul>
            </Section>


            <BackButton onClick={onBackToMain}>
                <Home size={15} /> 메인으로
            </BackButton>
        </Card>
    );
};

const Card = styled(CommonCard)`
    padding-bottom: 0.8rem;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: #9dabcF;
    margin-bottom: 0.4rem;
`;

const Section = styled.div`
    margin-top: 0.5rem;
    background: #f8faff;
    border-radius: 8px;
    padding: 0.6rem 0.7rem;
    font-size: 0.85rem;

    ul {
        padding-left: 1rem;
        margin: 0.3rem 0 0;
    }

    ol {
        padding-left: 1rem;
        margin: 0.3rem 0 0;
    }

    li {
        line-height: 1.4;
        margin-bottom: 0.25rem;
    }
`;

const SubTitle = styled.div`
    font-weight: 600;
    color: #414756;
    margin-bottom: 0.3rem;
    font-size: 0.9rem;
`;

const PrimaryButton = styled.button`
  background: #9dabcF;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.55rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;

  &:hover {
    background: #8a9bc5;
    transform: translateY(-1px);
  }
`;

export default CourseRegist;
