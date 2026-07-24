import React from "react";
import styled from "styled-components";
import {
  ArrowRight,
  Clock,
  ExternalLink,
  Home,
  MapPin,
  Truck,
} from "react-feather";
import { BackButton, CardTitle, CommonCard } from "../styles/CommonStyles";

const ShuttleCard = ({ data, onBackToMain }) => {
  const routes = data?.routes || [];

  return (
    <Card>
      <Header>
        <TitleGroup>
          <IconBox>
            <Truck size={19} />
          </IconBox>
          <div>
            <Eyebrow>국립공주대학교</Eyebrow>
            <CardTitle>무료 셔틀버스</CardTitle>
          </div>
        </TitleGroup>
        <Status $tone={data?.tone}>{data?.status || "운행 정보"}</Status>
      </Header>

      <StatusPanel $tone={data?.tone}>
        <Clock size={16} />
        <div>
          {data?.period && <strong>{data.period}</strong>}
          <span>{data?.description}</span>
        </div>
      </StatusPanel>

      {routes.length > 0 ? (
        <RouteSection>
          <SectionTitle>주요 노선</SectionTitle>
          <RouteList>
            {routes.map((route) => (
              <RouteRow key={route.name}>
                <RouteMain>
                  <RouteName>
                    {route.name.split("→").map((place, index, places) => (
                      <React.Fragment key={`${route.name}-${place}-${index}`}>
                        <span>{place.trim()}</span>
                        {index < places.length - 1 && (
                          <ArrowRight size={13} />
                        )}
                      </React.Fragment>
                    ))}
                  </RouteName>
                  {route.stops?.length > 0 && (
                    <Stops>
                      <MapPin size={12} />
                      <span>{route.stops.join(" · ")}</span>
                    </Stops>
                  )}
                </RouteMain>
                <TripList>
                  {route.trips?.map((trip, index) => (
                    <Trip key={`${route.name}-${trip.departure}-${index}`}>
                      <strong>{trip.departure}</strong>
                      {trip.arrival && <span>→ {trip.arrival}</span>}
                      {trip.note && <small>{trip.note}</small>}
                    </Trip>
                  ))}
                </TripList>
              </RouteRow>
            ))}
          </RouteList>
        </RouteSection>
      ) : (
        <EmptyState>표시할 수 있는 노선이 없습니다.</EmptyState>
      )}

      {data?.circulation && (
        <Circulation>
          <Truck size={14} />
          <div>
            <strong>캠퍼스 순환</strong>
            <span>{data.circulation}</span>
          </div>
        </Circulation>
      )}

      <Footer>
        <Notice>{data?.notice}</Notice>
        <OfficialLink
          href={data?.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          정류장별 공식 시간표 <ExternalLink size={13} />
        </OfficialLink>
      </Footer>

      <BackButton onClick={onBackToMain}>
        <Home size={15} /> 메인으로
      </BackButton>
    </Card>
  );
};

const Card = styled(CommonCard)`
  width: min(calc(100% - 48px), 510px);
  max-width: 510px;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const IconBox = styled.span`
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: var(--porty-primary-soft);
  color: var(--porty-primary-hover);
`;

const Eyebrow = styled.span`
  display: block;
  margin-bottom: 1px;
  color: var(--porty-subtext);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
`;

const Status = styled.span`
  flex: 0 0 auto;
  padding: 6px 9px;
  border-radius: 999px;
  background: ${({ $tone }) =>
    $tone === "active"
      ? "rgba(8, 184, 106, 0.14)"
      : $tone === "upcoming"
        ? "rgba(245, 166, 35, 0.14)"
        : "rgba(124, 137, 130, 0.14)"};
  color: ${({ $tone }) =>
    $tone === "active"
      ? "var(--porty-primary-hover)"
      : $tone === "upcoming"
        ? "#A76400"
        : "var(--porty-subtext)"};
  font-size: 11px;
  font-weight: 800;
`;

const StatusPanel = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid
    ${({ $tone }) =>
      $tone === "upcoming" ? "rgba(215, 142, 22, 0.24)" : "var(--porty-border)"};
  border-radius: 13px;
  background: ${({ $tone }) =>
    $tone === "upcoming" ? "rgba(245, 166, 35, 0.08)" : "var(--porty-canvas)"};
  color: var(--porty-subtext);

  svg {
    flex: 0 0 auto;
    margin-top: 2px;
  }

  div {
    display: grid;
    gap: 3px;
  }

  strong {
    color: var(--porty-text);
    font-size: 13px;
  }

  span {
    font-size: 12px;
    line-height: 1.45;
  }
`;

const RouteSection = styled.section`
  display: grid;
  gap: 8px;
`;

const SectionTitle = styled.h4`
  margin: 0;
  color: var(--porty-subtext);
  font-size: 11px;
  font-weight: 800;
`;

const RouteList = styled.div`
  overflow: hidden;
  border: 1px solid var(--porty-border);
  border-radius: 14px;
`;

const RouteRow = styled.div`
  display: grid;
  grid-template-columns: minmax(120px, 1fr) minmax(132px, auto);
  align-items: center;
  gap: 12px;
  padding: 11px 12px;

  & + & {
    border-top: 1px solid var(--porty-border);
  }

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
    gap: 7px;
  }
`;

const RouteMain = styled.div`
  min-width: 0;
`;

const RouteName = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--porty-text);
  font-size: 13px;
  font-weight: 760;

  svg {
    flex: 0 0 auto;
    color: var(--porty-primary);
  }
`;

const Stops = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-top: 5px;
  color: var(--porty-subtext);
  font-size: 10px;
  line-height: 1.4;

  svg {
    flex: 0 0 auto;
    margin-top: 1px;
  }
`;

const TripList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 5px;

  @media (max-width: 420px) {
    justify-content: flex-start;
  }
`;

const Trip = styled.span`
  min-width: 48px;
  display: grid;
  justify-items: center;
  padding: 5px 7px;
  border-radius: 9px;
  background: var(--porty-primary-soft);

  strong {
    color: var(--porty-text);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }

  span,
  small {
    color: var(--porty-subtext);
    font-size: 9px;
  }
`;

const Circulation = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--porty-primary-soft);
  color: var(--porty-primary-hover);

  div {
    display: grid;
    gap: 1px;
  }

  strong {
    font-size: 11px;
  }

  span {
    color: var(--porty-subtext);
    font-size: 11px;
  }
`;

const EmptyState = styled.p`
  margin: 0;
  padding: 18px;
  border-radius: 13px;
  background: var(--porty-canvas);
  color: var(--porty-subtext);
  font-size: 12px;
  text-align: center;
`;

const Footer = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;

  @media (max-width: 420px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }
`;

const Notice = styled.p`
  margin: 0;
  color: var(--porty-subtext);
  font-size: 10px;
  line-height: 1.45;
`;

const OfficialLink = styled.a`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--porty-primary-hover);
  font-size: 11px;
  font-weight: 750;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

export default ShuttleCard;
