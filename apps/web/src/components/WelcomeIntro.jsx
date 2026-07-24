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
      <WelcomeCopy $isDark={isDark}>
        <WelcomeCharacter>
          <img src="/assets/knung-greeting.png" alt="손을 흔들며 인사하는 크눙이" />
        </WelcomeCharacter>

        <div>
          <WelcomeTitle>
            안녕하세요! 공주대학교 챗봇 포티입니다.
          </WelcomeTitle>
          <WelcomeDescription>
            오늘 필요한 학교생활 정보, 포티에게 편하게 물어보세요.
          </WelcomeDescription>
        </div>
      </WelcomeCopy>

      <WelcomePrompt>
        <span>자주 찾는 메뉴</span>
        <small>궁금한 내용을 골라 바로 확인해 보세요.</small>
      </WelcomePrompt>
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
