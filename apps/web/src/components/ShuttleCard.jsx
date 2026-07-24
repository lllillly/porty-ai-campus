import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Clock,
  ExternalLink,
  Home,
  Info,
  MapPin,
} from "react-feather";
import { BackButton, CommonCard } from "../styles/CommonStyles";

const EMPTY_GROUPS = [];
const EMPTY_ROUTES = [];

const TABLE_META = {
  "천안캠퍼스↔시내 순환(등교시)": {
    title: "등교 순환",
    route: "공대 → 터미널 → 두정역 → 공대",
  },
  "천안캠퍼스↔시내 순환(하교시)": {
    title: "하교 순환",
    route: "공대 → 두정역 → 터미널 → 공대",
  },
};

const splitStopName = (name = "") => {
  const match = name.match(/^(.+?)(\(.+\))$/);
  return match
    ? { name: match[1], detail: match[2].slice(1, -1) }
    : { name, detail: "" };
};

const StopLabel = ({ name, index, columns }) => {
  const stop = splitStopName(name);
  const isRoundTrip =
    columns.length > 1 && columns[0] === columns[columns.length - 1];
  const suffix =
    isRoundTrip && index === 0
      ? "출발"
      : isRoundTrip && index === columns.length - 1
        ? "도착"
        : "";

  return (
    <>
      <span>{stop.name}</span>
      {(stop.detail || suffix) && (
        <small>{[stop.detail, suffix].filter(Boolean).join(" · ")}</small>
      )}
    </>
  );
};

const ScheduleTable = ({ table }) => {
  const meta = TABLE_META[table.name] || {
    title: table.name,
    route: table.columns?.join(" → "),
  };

  return (
    <TableBlock>
      <TableHeading>
        <div>
          <strong>{meta.title}</strong>
          <span>{meta.route}</span>
        </div>
        <small>{table.rows?.length || 0}회 운행</small>
      </TableHeading>

      <TableScroller>
        <TimeTable>
          <thead>
            <tr>
              <th>회차</th>
              {table.columns?.map((column, index) => (
                <th key={`${table.name}-${column}-${index}`}>
                  <StopLabel
                    name={column}
                    index={index}
                    columns={table.columns}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows?.map((row, rowIndex) => (
              <tr key={`${table.name}-${row.id || rowIndex}`}>
                <th>{rowIndex + 1}</th>
                {row.times?.map((time, timeIndex) => (
                  <td key={`${table.name}-${rowIndex}-${timeIndex}`}>
                    {time}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </TimeTable>
      </TableScroller>
    </TableBlock>
  );
};

const RouteTable = ({ route }) => (
  <TableBlock>
    <TableHeading>
      <div>
        <strong>{route.name}</strong>
        {route.stops?.length > 0 && (
          <span>
            <MapPin size={11} />
            {route.stops.join(" → ")}
          </span>
        )}
      </div>
    </TableHeading>
    <TableScroller>
      <TimeTable $compact>
        <thead>
          <tr>
            <th>회차</th>
            <th>출발</th>
            <th>도착</th>
            <th>운행 차량</th>
          </tr>
        </thead>
        <tbody>
          {route.trips?.map((trip, index) => (
            <tr key={`${route.name}-${trip.departure}-${index}`}>
              <th>{index + 1}</th>
              <td>{trip.departure}</td>
              <td>{trip.arrival || "–"}</td>
              <td>{trip.note || "–"}</td>
            </tr>
          ))}
        </tbody>
      </TimeTable>
    </TableScroller>
  </TableBlock>
);

const ShuttleCard = ({ data, onBackToMain }) => {
  const groups = data?.groups || EMPTY_GROUPS;
  const routes = data?.routes || EMPTY_ROUTES;
  const [activeGroup, setActiveGroup] = useState(
    data?.selectedGroup || groups[0]?.id,
  );

  useEffect(() => {
    setActiveGroup(data?.selectedGroup || groups[0]?.id);
  }, [data?.selectedGroup, groups]);

  const selected =
    groups.find((group) => group.id === activeGroup) || groups[0];
  const hasCirculationTables = groups.length > 0;

  return (
    <Card>
      <Header>
        <div>
          <Eyebrow>국립공주대학교 버스 안내</Eyebrow>
          <Title>
            {hasCirculationTables ? "순환버스 시간표" : "무료버스 시간표"}
          </Title>
        </div>
        <Status $tone={data?.tone}>
          <span />
          {data?.status || "운행 정보"}
        </Status>
      </Header>

      <ServiceInfo>
        <Clock size={15} />
        <div>
          {data?.period && <strong>{data.period}</strong>}
          <span>{data?.description}</span>
        </div>
      </ServiceInfo>

      {hasCirculationTables ? (
        <>
          <Tabs role="tablist" aria-label="순환버스 노선 선택">
            {groups.map((group) => (
              <Tab
                key={group.id}
                role="tab"
                aria-selected={selected?.id === group.id}
                $active={selected?.id === group.id}
                onClick={() => setActiveGroup(group.id)}
              >
                {group.label}
              </Tab>
            ))}
          </Tabs>

          <Tables>
            {selected?.tables?.map((table) => (
              <ScheduleTable key={table.name} table={table} />
            ))}
          </Tables>
        </>
      ) : routes.length > 0 ? (
        <Tables>
          {routes.map((route) => (
            <RouteTable key={route.name} route={route} />
          ))}
        </Tables>
      ) : (
        <EmptyState>표시할 수 있는 노선이 없습니다.</EmptyState>
      )}

      <Notice>
        <Info size={14} />
        <span>{data?.notice}</span>
      </Notice>

      <Actions>
        <OfficialLink
          href={data?.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          공식 시간표 확인 <ExternalLink size={13} />
        </OfficialLink>
        <BackButton onClick={onBackToMain}>
          <Home size={14} /> 다른 메뉴 보기
        </BackButton>
      </Actions>
    </Card>
  );
};

const Card = styled(CommonCard)`
  width: min(calc(100% - 48px), 680px);
  max-width: 680px;
  padding: 22px;
  border-radius: 18px;

  @media (max-width: 480px) {
    width: calc(100% - 48px);
    padding: 17px 15px;
    border-radius: 16px;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
`;

const Eyebrow = styled.span`
  display: block;
  margin-bottom: 4px;
  color: var(--porty-subtext);
  font-size: 11px;
  font-weight: 600;
`;

const Title = styled.h3`
  margin: 0;
  color: var(--porty-text);
  font-size: 20px;
  font-weight: 780;
  letter-spacing: -0.035em;
`;

const Status = styled.span`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding-top: 4px;
  color: ${({ $tone }) =>
    $tone === "active"
      ? "var(--porty-primary-hover)"
      : "var(--porty-subtext)"};
  font-size: 11px;
  font-weight: 700;

  > span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${({ $tone }) =>
      $tone === "active"
        ? "var(--porty-primary)"
        : $tone === "upcoming"
          ? "#E5A833"
          : "#A7B0AB"};
  }
`;

const ServiceInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-bottom: 18px;
  padding: 11px 12px;
  border-radius: 10px;
  background: var(--porty-surface-soft);
  color: var(--porty-subtext);

  svg {
    flex: 0 0 auto;
    margin-top: 2px;
  }

  div {
    display: grid;
    gap: 2px;
  }

  strong {
    color: var(--porty-text);
    font-size: 12px;
  }

  span {
    font-size: 11px;
    line-height: 1.45;
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  padding: 4px;
  border-radius: 10px;
  background: var(--porty-surface-soft);
`;

const Tab = styled.button`
  min-width: 0;
  flex: 1;
  min-height: 38px;
  padding: 8px 10px;
  border: 0;
  border-radius: 7px;
  background: ${({ $active }) =>
    $active ? "var(--porty-surface)" : "transparent"};
  box-shadow: ${({ $active }) =>
    $active ? "0 1px 5px rgba(40, 64, 52, 0.1)" : "none"};
  color: ${({ $active }) =>
    $active ? "var(--porty-text)" : "var(--porty-subtext)"};
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? 720 : 550)};
  cursor: pointer;
`;

const Tables = styled.div`
  display: grid;
  gap: 14px;
`;

const TableBlock = styled.section`
  overflow: hidden;
  border: 1px solid var(--porty-border);
  border-radius: 12px;
`;

const TableHeading = styled.div`
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--porty-border);

  > div {
    min-width: 0;
    display: grid;
    gap: 3px;
  }

  strong {
    color: var(--porty-text);
    font-size: 13px;
    font-weight: 730;
  }

  span {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    overflow: hidden;
    color: var(--porty-subtext);
    font-size: 10px;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > small {
    flex: 0 0 auto;
    color: var(--porty-subtext);
    font-size: 10px;
  }
`;

const TableScroller = styled.div`
  max-width: 100%;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 5px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 99px;
    background: var(--porty-border);
  }
`;

const TimeTable = styled.table`
  width: 100%;
  min-width: ${({ $compact }) => ($compact ? "430px" : "560px")};
  border-collapse: collapse;
  color: var(--porty-text);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  text-align: center;

  th,
  td {
    height: 40px;
    padding: 6px 9px;
    border-right: 1px solid var(--porty-border);
    border-bottom: 1px solid var(--porty-border);
    white-space: nowrap;

    &:last-child {
      border-right: 0;
    }
  }

  thead th {
    min-width: 88px;
    background: var(--porty-surface-soft);
    color: var(--porty-subtext);
    font-size: 10px;
    font-weight: 650;

    &:first-child {
      min-width: 46px;
      width: 46px;
    }

    span,
    small {
      display: block;
    }

    small {
      margin-top: 2px;
      color: var(--porty-subtext);
      font-size: 8px;
      font-weight: 500;
    }
  }

  tbody th {
    width: 46px;
    background: var(--porty-surface-soft);
    color: var(--porty-subtext);
    font-size: 10px;
    font-weight: 600;
  }

  tbody td {
    font-size: 12px;
    font-weight: 650;
  }

  tbody tr:last-child th,
  tbody tr:last-child td {
    border-bottom: 0;
  }
`;

const Notice = styled.p`
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin: 14px 0 0;
  color: var(--porty-subtext);
  font-size: 10px;
  line-height: 1.5;

  svg {
    flex: 0 0 auto;
    margin-top: 1px;
  }
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 14px;

  ${BackButton} {
    min-height: 42px;
    margin-top: 0;
  }
`;

const OfficialLink = styled.a`
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid var(--porty-primary);
  border-radius: 12px;
  background: var(--porty-primary-soft);
  color: var(--porty-primary-hover);
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    background: var(--porty-primary);
    color: #173c2d;
  }
`;

const EmptyState = styled.p`
  margin: 0;
  padding: 20px;
  border-radius: 10px;
  background: var(--porty-surface-soft);
  color: var(--porty-subtext);
  font-size: 12px;
  text-align: center;
`;

export default ShuttleCard;
