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
    margin-bottom: 0.6rem;
`;

const MapButton = styled.a`
    display: inline-block;
    background: #9dabcF;
    color: #fff;
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    font-size: 0.8rem;
    text-decoration: none;
    &:hover { background: #8a9bc5; }
`;

export default CampusMap;

