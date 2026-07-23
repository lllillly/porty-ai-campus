import React from "react";
import styled from "styled-components";
import { Home } from "react-feather";
import { CommonCard, BackButton, CardTitle, Text } from "../styles/CommonStyles";

// API: GET /api/campus/location?campus={캠퍼스명}
const campusData = {
    공주: { address: "공주시 공주대학로 56", mapUrl: "https://map.kakao.com/link/map/공주시 공주대학로 56" },
    천안: { address: "천안시 서북구 천안대로 1223-24", mapUrl: "https://map.kakao.com/link/map/천안시 서북구 천안대로 1223-24" },
    예산: { address: "예산군 예산읍 대학로 54", mapUrl: "https://map.kakao.com/link/map/예산군 예산읍 대학로 54" },
};

const CampusMap = ({ onBackToMain }) => (
    <Card>
        {Object.entries(campusData).map(([name, info]) => (
            <Campus key={name}>
                <CardTitle>{name}캠퍼스</CardTitle>
                <Text>{info.address}</Text>
                <MapButton href={info.mapUrl} target="_blank">카카오맵 보기</MapButton>
            </Campus>
        ))}
        <BackButton onClick={onBackToMain}><Home size={15}/> 메인으로</BackButton>
    </Card>
);

const Card = styled(CommonCard)``;

const Campus = styled.div`
    margin-bottom: 12px;
    padding: 12px;
    border-radius: 12px;
    background: var(--porty-surface-soft);
`;

const MapButton = styled.a`
    display: inline-block;
    margin-top: 4px;
    color: var(--porty-primary-hover);
    padding: 5px 0;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    &:hover { text-decoration: underline; text-underline-offset: 3px; }
`;

export default CampusMap;
