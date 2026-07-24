import React from "react";
import { Star } from "react-feather";
import QuickActions from "./QuickActions";
import {
  WelcomeCard,
  WelcomeCharacter,
  WelcomeCopy,
  WelcomeEyebrow,
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
          <span aria-hidden="true">
            <Star size={15} />
          </span>
          <img src="/assets/knung.png" alt="크눙이" />
        </WelcomeCharacter>

        <div>
          <WelcomeEyebrow>
            <span />
            KONGJU CAMPUS GUIDE
          </WelcomeEyebrow>
          <WelcomeTitle>
            오늘 학교생활,
            <br />
            무엇을 도와드릴까요?
          </WelcomeTitle>
          <WelcomeDescription>
            공주대 생활에 필요한 정보를 포티에게 편하게 물어보세요.
          </WelcomeDescription>
        </div>
      </WelcomeCopy>

      <WelcomePrompt>자주 찾는 메뉴</WelcomePrompt>
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
