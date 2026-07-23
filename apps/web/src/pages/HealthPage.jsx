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
  height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: var(--porty-canvas);
`;

const Title = styled.h2`
  margin: 0 0 16px;
  color: var(--porty-text);
  font-size: 20px;
  letter-spacing: -0.025em;
`;

const Table = styled.div`
  width: min(100%, 320px);
  padding: 14px 18px;
  border: 1px solid var(--porty-border);
  border-radius: 18px;
  background: var(--porty-surface);
  box-shadow: var(--porty-shadow);
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 48px;
  padding: 8px 0;
  border-bottom: 1px solid var(--porty-border);

  &:last-child {
    border-bottom: none;
  }
`;

const Cell = styled.span`
  font-weight: 500;
  color: var(--porty-text);
`;

const Value = styled.span`
  color: var(--porty-primary-hover);
  font-size: 13px;
  font-weight: 700;
`;

export default HealthPage;
