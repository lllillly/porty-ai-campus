import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Home,
} from "react-feather";
import { getScheduleCalendar } from "../api/contentApi";
import { BackButton, CardTitle, CommonCard } from "../styles/CommonStyles";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const OFFICIAL_CALENDAR_URL =
  "https://www.kongju.ac.kr/KNU/16834/subview.do";

const localDateKey = (year, month, day) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const moveMonth = ({ year, month }, offset) => {
  const next = new Date(year, month - 1 + offset, 1);
  return { year: next.getFullYear(), month: next.getMonth() + 1 };
};

const CalendarCard = ({ onBackToMain }) => {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  });
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [state, setState] = useState({ status: "loading", events: [] });

  useEffect(() => {
    let active = true;
    setState({ status: "loading", events: [] });

    getScheduleCalendar(view)
      .then((result) => {
        if (!active) return;
        const events = result.events || [];
        setState({ status: "ready", events, notice: result.notice });

        const todayIsVisible =
          view.year === today.getFullYear() &&
          view.month === today.getMonth() + 1;
        const firstEventDay = events[0]?.startDate
          ? Number(events[0].startDate.slice(-2))
          : 1;
        setSelectedDay(todayIsVisible ? today.getDate() : firstEventDay);
      })
      .catch(() => {
        if (active) {
          setState({ status: "error", events: [] });
          setSelectedDay(
            view.year === today.getFullYear() &&
              view.month === today.getMonth() + 1
              ? today.getDate()
              : 1,
          );
        }
      });

    return () => {
      active = false;
    };
  }, [today, view]);

  const calendarDays = useMemo(() => {
    const firstWeekday = new Date(view.year, view.month - 1, 1).getDay();
    const lastDay = new Date(view.year, view.month, 0).getDate();
    const cells = [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: lastDay }, (_, index) => index + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [view]);

  const eventsForDay = (day) => {
    const key = localDateKey(view.year, view.month, day);
    return state.events.filter(
      (event) => event.startDate <= key && event.endDate >= key,
    );
  };

  const selectedEvents = eventsForDay(selectedDay);
  const isToday = (day) =>
    view.year === today.getFullYear() &&
    view.month === today.getMonth() + 1 &&
    day === today.getDate();

  const changeMonth = (offset) => {
    setView((current) => moveMonth(current, offset));
  };

  return (
    <Card>
      <CardHeader>
        <TitleGroup>
          <Calendar size={18} />
          <CardTitle>학사일정</CardTitle>
        </TitleGroup>
        <OfficialLink
          href={OFFICIAL_CALENDAR_URL}
          target="_blank"
          rel="noreferrer"
        >
          공식 일정 <ExternalLink size={13} />
        </OfficialLink>
      </CardHeader>

      <MonthNavigation>
        <MonthButton
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label="이전 달"
        >
          <ChevronLeft size={19} />
        </MonthButton>
        <MonthTitle>
          <strong>{view.month}월</strong>
          <span>{view.year}</span>
        </MonthTitle>
        <MonthButton
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="다음 달"
        >
          <ChevronRight size={19} />
        </MonthButton>
      </MonthNavigation>

      <CalendarGrid aria-label={`${view.year}년 ${view.month}월 학사일정`}>
        {WEEKDAYS.map((weekday, index) => (
          <Weekday key={weekday} $sunday={index === 0} $saturday={index === 6}>
            {weekday}
          </Weekday>
        ))}
        {calendarDays.map((day, index) =>
          day ? (
            <DayButton
              type="button"
              key={`${view.year}-${view.month}-${day}`}
              $selected={selectedDay === day}
              $today={isToday(day)}
              $hasEvents={eventsForDay(day).length > 0}
              $sunday={index % 7 === 0}
              $saturday={index % 7 === 6}
              onClick={() => setSelectedDay(day)}
              aria-pressed={selectedDay === day}
              aria-label={`${view.month}월 ${day}일${
                eventsForDay(day).length
                  ? `, 일정 ${eventsForDay(day).length}개`
                  : ""
              }`}
            >
              <span>{day}</span>
            </DayButton>
          ) : (
            <EmptyDay key={`empty-${index}`} aria-hidden="true" />
          ),
        )}
      </CalendarGrid>

      <SchedulePanel>
        <SelectedDate>
          {view.month}월 {selectedDay}일
          {isToday(selectedDay) && <TodayBadge>오늘</TodayBadge>}
        </SelectedDate>

        {state.status === "loading" ? (
          <StateMessage>공식 학사일정을 불러오고 있습니다.</StateMessage>
        ) : selectedEvents.length > 0 ? (
          <EventList>
            {selectedEvents.map((event) => (
              <EventItem key={event.id}>
                <EventDot />
                <div>
                  <strong>{event.title}</strong>
                  <span>{event.dateLabel}</span>
                </div>
              </EventItem>
            ))}
          </EventList>
        ) : (
          <StateMessage>
            {state.status === "error"
              ? "일정을 불러오지 못했습니다. 공식 일정에서 확인해 주세요."
              : "이 날짜에 등록된 학사일정이 없습니다."}
          </StateMessage>
        )}
      </SchedulePanel>

      <Notice>일정은 학교 사정에 따라 변경될 수 있습니다.</Notice>
      <BackButton onClick={onBackToMain}>
        <Home size={15} /> 메인으로
      </BackButton>
    </Card>
  );
};

const Card = styled(CommonCard)`
  width: min(calc(100% - 48px), 430px);
  max-width: 430px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;

  svg {
    color: var(--porty-primary);
  }
`;

const OfficialLink = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--porty-primary-hover);
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const MonthNavigation = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  margin-bottom: 12px;
`;

const MonthButton = styled.button`
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid var(--porty-border);
  border-radius: 13px;
  background: var(--porty-surface);
  color: var(--porty-subtext);
  cursor: pointer;

  &:hover {
    border-color: var(--porty-primary);
    background: var(--porty-primary-soft);
    color: var(--porty-text);
  }
`;

const MonthTitle = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 7px;
  color: var(--porty-text);

  strong {
    font-size: 19px;
    letter-spacing: -0.03em;
  }

  span {
    color: var(--porty-subtext);
    font-size: 12px;
    font-weight: 600;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 3px;
`;

const Weekday = styled.div`
  padding: 5px 0 7px;
  color: ${({ $sunday, $saturday }) =>
    $sunday ? "#E5484D" : $saturday ? "#4B72D9" : "var(--porty-subtext)"};
  font-size: 11px;
  font-weight: 700;
  text-align: center;
`;

const EmptyDay = styled.div`
  aspect-ratio: 1;
`;

const DayButton = styled.button`
  min-width: 0;
  aspect-ratio: 1;
  position: relative;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 12px;
  background: ${({ $selected, $today }) =>
    $selected
      ? "var(--porty-primary)"
      : $today
        ? "var(--porty-primary-soft)"
        : "transparent"};
  color: ${({ $selected, $sunday, $saturday }) =>
    $selected
      ? "#10251A"
      : $sunday
        ? "#D64045"
        : $saturday
          ? "#4568C5"
          : "var(--porty-text)"};
  font-size: 12px;
  font-weight: ${({ $selected, $today }) =>
    $selected || $today ? 750 : 500};
  cursor: pointer;

  &:hover {
    background: ${({ $selected }) =>
      $selected ? "var(--porty-primary)" : "var(--porty-surface-soft)"};
  }

  &::after {
    width: 4px;
    height: 4px;
    position: absolute;
    bottom: 4px;
    border-radius: 50%;
    background: ${({ $selected }) =>
      $selected ? "#10251A" : "var(--porty-primary)"};
    content: ${({ $hasEvents }) => ($hasEvents ? '""' : "none")};
  }
`;

const SchedulePanel = styled.div`
  min-height: 84px;
  margin-top: 13px;
  padding: 13px;
  border-radius: 14px;
  background: var(--porty-surface-soft);
`;

const SelectedDate = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--porty-text);
  font-size: 13px;
  font-weight: 750;
`;

const TodayBadge = styled.span`
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--porty-primary-soft);
  color: var(--porty-primary-hover);
  font-size: 10px;
  font-weight: 800;
`;

const StateMessage = styled.p`
  margin: 9px 0 0;
  color: var(--porty-subtext);
  font-size: 12px;
  line-height: 1.5;
`;

const EventList = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 10px;
`;

const EventItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;

  div {
    display: grid;
    gap: 2px;
  }

  strong {
    color: var(--porty-text);
    font-size: 12px;
    line-height: 1.4;
  }

  span {
    color: var(--porty-subtext);
    font-size: 10px;
  }
`;

const EventDot = styled.span`
  width: 7px;
  height: 7px;
  flex: 0 0 7px;
  margin-top: 5px;
  border-radius: 50%;
  background: var(--porty-primary);
`;

const Notice = styled.p`
  margin: 9px 0 0;
  color: var(--porty-subtext);
  font-size: 10px;
  line-height: 1.45;
  text-align: center;
`;

export default CalendarCard;
