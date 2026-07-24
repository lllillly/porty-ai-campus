import React from "react";
import {
  SplashOverlay,
  SplashBox,
  SplashImage,
  SplashLogo,
  SplashSubtitle,
} from "../styles/ChatPage.styles";

const SplashScreen = () => (
  <SplashOverlay>
    <SplashBox>
      <SplashImage src="/assets/knung-icon.png" alt="" />
      <SplashLogo>포티</SplashLogo>
      <SplashSubtitle>오늘의 공주대 생활을 함께 찾아봐요</SplashSubtitle>
    </SplashBox>
  </SplashOverlay>
);

export default SplashScreen;
