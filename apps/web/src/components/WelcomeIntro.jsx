import React from "react";
import QuickActions from "./QuickActions";
import {
  WelcomeCard,
  WelcomeCharacter,
  WelcomeCopy,
  WelcomeTitle,
  WelcomeDescription,
  WelcomePrompt,
} from "../styles/ChatPage.styles";

const WelcomeIntro = ({
  onActionClick,
  onDietSetup,
  hasDietSettings,
  isDark,
}) => {
  return (
    <WelcomeCard>
      <WelcomeCopy>
        <WelcomeCharacter>
          <img src="/assets/knung.png" alt="크눙이" />
        </WelcomeCharacter>

        <div>
          <WelcomeTitle>
            안녕하세요, 국립공주대학교 챗봇 포티입니다.
          </WelcomeTitle>
          <WelcomeDescription>
            학사일정부터 식단과 순환버스까지, 학교생활에 필요한 정보를
            찾아보세요.
          </WelcomeDescription>
        </div>
      </WelcomeCopy>

      <WelcomePrompt>바로 찾기</WelcomePrompt>
      <QuickActions
        featured
        onActionClick={onActionClick}
        onDietSetup={onDietSetup}
        hasDietSettings={hasDietSettings}
        isDark={isDark}
      />
    </WelcomeCard>
  );
};

export default WelcomeIntro;
