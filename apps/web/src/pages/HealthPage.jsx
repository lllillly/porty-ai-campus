import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { CheckCircle, XCircle } from "react-feather";
import { getSystemHealth } from "../api/healthApi";

const HealthPage = () => {
    const [status, setStatus] = useState({
        web: "loading",
        ai: "loading",
        database: "loading",
    });

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                setStatus(await getSystemHealth());
            } catch (error) {
                console.error("Health check failed:", error);
                setStatus({ web: "OK", ai: "FAIL", database: "FAIL" });
            }
        };

        fetchHealth();
    }, []);

    const getIcon = (value) =>
        value === "OK" ? (
            <CheckCircle color="#52c41a" size={18} />
        ) : (
            <XCircle color="#ff4d4f" size={18} />
        );

    return (
        <Container>
            <Title>서버 상태 확인</Title>
            <Table>
                <Row>
                    <Cell>웹 애플리케이션</Cell>
                    <Cell>{getIcon(status.web)}</Cell>
                    <Value>{status.web}</Value>
                </Row>
                <Row>
                    <Cell>AI 서버</Cell>
                    <Cell>{getIcon(status.ai)}</Cell>
                    <Value>{status.ai}</Value>
                </Row>
                <Row>
                    <Cell>Supabase</Cell>
                    <Cell>{getIcon(status.database)}</Cell>
                    <Value>{status.database}</Value>
                </Row>
            </Table>
        </Container>
    );
};

/* -------------------- 스타일 -------------------- */
const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f7fbff;
  font-family: "Pretendard", sans-serif;
`;

const Title = styled.h2`
  color: #414756;
  margin-bottom: 1rem;
`;

const Table = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1.2rem 1.5rem;
  width: 280px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const Cell = styled.span`
  font-weight: 500;
  color: #414756;
`;

const Value = styled.span`
  color: #9dabcF;
  font-size: 0.9rem;
`;

export default HealthPage;
