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
          <WelcomeTitle>오늘 학교에서 뭐가 필요하세요?</WelcomeTitle>
          <WelcomeDescription>
            시간표부터 오늘 메뉴까지, 필요한 내용을 바로 찾아보세요.
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
