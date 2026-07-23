import React from "react";
import {
    SplashOverlay,
    SplashBox,
    SplashImage,
    SplashLogo,
    SplashSubtitle
} from "../styles/ChatPage.styles";

const SplashScreen = () => {
    return (
        <SplashOverlay>
            <SplashBox>
                <SplashImage src="/assets/knu_logo.png" />
                <SplashLogo>PORTY</SplashLogo>
                <SplashSubtitle>공주대학교의 모든 것을 알려주는 LLM</SplashSubtitle>
            </SplashBox>
        </SplashOverlay>
    );
};

export default SplashScreen;
