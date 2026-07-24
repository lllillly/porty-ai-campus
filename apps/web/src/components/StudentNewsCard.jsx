import React from "react";
import styled from "styled-components";
import {
  ArrowRight,
  Bell,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Home,
  Star,
} from "react-feather";
import { BackButton, CardTitle, CommonCard } from "../styles/CommonStyles";

const compactDate = (value = "") => value.replaceAll(".", ". ").trim();

const StudentNewsCard = ({ data, onRead, onBackToMain }) => {
  const items = data?.items || [];
  const isDetail = data?.view === "detail";
  const isError = data?.view === "error";

  return (
    <Card>
      <Header>
        <TitleGroup>
          <IconBox>
            <Bell size={18} />
          </IconBox>
          <div>
            <Eyebrow>
              <Star size={11} /> KNU LIVE
            </Eyebrow>
            <CardTitle>{data?.title || "학생소식"}</CardTitle>
          </div>
        </TitleGroup>
        {!isError && <LiveBadge>실시간</LiveBadge>}
      </Header>

      {items.length > 0 ? (
        <NewsList>
          {items.map((item, index) => (
            <NewsItem key={item.url} $detail={isDetail}>
              <NewsTop>
                <NumberBadge>{String(index + 1).padStart(2, "0")}</NumberBadge>
                <NewsHeading>
                  <NewsTitle>{item.title}</NewsTitle>
                  <Meta>
                    <Calendar size={11} />
                    {compactDate(item.date)}
                    {item.author && <span>· {item.author}</span>}
                  </Meta>
                </NewsHeading>
              </NewsTop>

              {isDetail ? (
                <>
                  <Content>{item.content || item.preview}</Content>
                  {item.images?.map((image, imageIndex) => (
                    <NoticeImage
                      key={`${image}-${imageIndex}`}
                      src={image}
                      alt={`${item.title} 공지 이미지`}
                      loading="lazy"
                    />
                  ))}
                  {item.attachments?.length > 0 && (
                    <AttachmentList>
                      <AttachmentLabel>
                        <FileText size={13} /> 첨부파일
                      </AttachmentLabel>
                      {item.attachments.map((attachment) => (
                        <Attachment
                          key={attachment.url}
                          href={attachment.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span>{attachment.name}</span>
                          <Download size={13} />
                        </Attachment>
                      ))}
                    </AttachmentList>
                  )}
                </>
              ) : (
                <Preview>{item.preview}</Preview>
              )}

              <Actions>
                {!isDetail && (
                  <ReadButton
                    type="button"
                    onClick={() => onRead?.(index)}
                  >
                    내용 보기 <ArrowRight size={13} />
                  </ReadButton>
                )}
                <OriginalLink
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  공식 원문 <ExternalLink size={12} />
                </OriginalLink>
              </Actions>
            </NewsItem>
          ))}
        </NewsList>
      ) : (
        <EmptyState>
          지금은 학생소식을 불러오지 못했습니다. 공식 게시판에서 확인해
          주세요.
        </EmptyState>
      )}

      <CardFooter>
        <UpdatedAt>
          학교 홈페이지에서 방금 확인한 내용입니다.
        </UpdatedAt>
        <BoardLink
          href={data?.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          학생소식 전체 보기 <ExternalLink size={12} />
        </BoardLink>
      </CardFooter>

      <BackButton onClick={onBackToMain}>
        <Home size={15} /> 메인으로
      </BackButton>
    </Card>
  );
};

const Card = styled(CommonCard)`
  width: min(calc(100% - 48px), 520px);
  max-width: 520px;
  padding: 19px;
  border-color: color-mix(
    in srgb,
    var(--porty-primary) 24%,
    var(--porty-border)
  );
  background:
    linear-gradient(
      155deg,
      color-mix(in srgb, var(--porty-primary-soft) 38%, transparent),
      transparent 34%
    ),
    var(--porty-surface);
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 15px;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const IconBox = styled.span`
  width: 39px;
  height: 39px;
  display: grid;
  place-items: center;
  border-radius: 14px 14px 14px 5px;
  background: var(--porty-primary);
  color: #143d2c;
  box-shadow: 0 7px 16px rgba(55, 145, 105, 0.2);
`;

const Eyebrow = styled.span`
  display: flex;
  align-items: center;
  gap: 3px;
  margin-bottom: 2px;
  color: var(--porty-primary-hover);
  font-size: 9px;
  font-weight: 850;
  letter-spacing: 0.08em;
`;

const LiveBadge = styled.span`
  padding: 5px 9px;
  border: 1px solid rgba(70, 184, 132, 0.22);
  border-radius: 999px;
  background: var(--porty-primary-soft);
  color: var(--porty-primary-hover);
  font-size: 10px;
  font-weight: 800;

  &::before {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 5px;
    border-radius: 50%;
    background: var(--porty-primary);
    content: "";
  }
`;

const NewsList = styled.div`
  display: grid;
  gap: 10px;
`;

const NewsItem = styled.article`
  padding: 13px;
  border: 1px solid var(--porty-border);
  border-radius: 15px;
  background: color-mix(
    in srgb,
    var(--porty-surface) 92%,
    var(--porty-primary-soft)
  );
  transition:
    border-color 160ms ease,
    transform 160ms ease,
    box-shadow 160ms ease;

  &:hover {
    border-color: color-mix(
      in srgb,
      var(--porty-primary) 48%,
      var(--porty-border)
    );
    box-shadow: 0 8px 22px rgba(42, 91, 69, 0.08);
    transform: translateY(-1px);
  }
`;

const NewsTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 9px;
`;

const NumberBadge = styled.span`
  width: 27px;
  height: 27px;
  flex: 0 0 27px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: var(--porty-accent-soft);
  color: var(--porty-accent-text);
  font-size: 10px;
  font-weight: 850;
`;

const NewsHeading = styled.div`
  min-width: 0;
`;

const NewsTitle = styled.h4`
  margin: 0;
  color: var(--porty-text);
  font-size: 13px;
  font-weight: 760;
  line-height: 1.45;
  letter-spacing: -0.02em;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 5px;
  color: var(--porty-subtext);
  font-size: 10px;
`;

const Preview = styled.p`
  display: -webkit-box;
  margin: 9px 0 0 36px;
  overflow: hidden;
  color: var(--porty-subtext);
  font-size: 11px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

const Content = styled.p`
  margin: 11px 0 0 36px;
  color: var(--porty-subtext);
  font-size: 12px;
  line-height: 1.65;
  white-space: pre-line;

  @media (max-width: 420px) {
    margin-left: 0;
  }
`;

const NoticeImage = styled.img`
  width: calc(100% - 36px);
  max-height: 480px;
  aspect-ratio: 3 / 4;
  display: block;
  margin: 11px 0 0 36px;
  border: 1px solid var(--porty-border);
  border-radius: 12px;
  background: white;
  object-fit: contain;

  @media (max-width: 420px) {
    width: 100%;
    margin-left: 0;
  }
`;

const AttachmentList = styled.div`
  display: grid;
  gap: 5px;
  margin: 11px 0 0 36px;

  @media (max-width: 420px) {
    margin-left: 0;
  }
`;

const AttachmentLabel = styled.strong`
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--porty-subtext);
  font-size: 10px;
`;

const Attachment = styled.a`
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--porty-surface-soft);
  color: var(--porty-text);
  font-size: 10px;
  font-weight: 650;
  text-decoration: none;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  svg {
    flex: 0 0 auto;
    color: var(--porty-primary-hover);
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  margin-top: 11px;
`;

const ActionBase = styled.a`
  min-height: 31px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 7px 10px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 750;
  text-decoration: none;
`;

const ReadButton = styled.button`
  min-height: 31px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 7px 10px;
  border: 0;
  border-radius: 10px;
  background: var(--porty-primary);
  color: #143d2c;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
`;

const OriginalLink = styled(ActionBase)`
  border: 1px solid var(--porty-border);
  background: var(--porty-surface);
  color: var(--porty-subtext);
`;

const EmptyState = styled.div`
  padding: 22px 16px;
  border-radius: 14px;
  background: var(--porty-surface-soft);
  color: var(--porty-subtext);
  font-size: 12px;
  line-height: 1.55;
  text-align: center;
`;

const CardFooter = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;

  @media (max-width: 430px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }
`;

const UpdatedAt = styled.span`
  color: var(--porty-subtext);
  font-size: 9px;
`;

const BoardLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--porty-primary-hover);
  font-size: 10px;
  font-weight: 750;
  text-decoration: none;
`;

export default StudentNewsCard;
