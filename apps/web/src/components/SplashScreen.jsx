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
                <SplashImage src="/assets/porty-mark.svg" alt="" />
                <SplashLogo>PORTY</SplashLogo>
                <SplashSubtitle>공주대학교 캠퍼스 AI 도우미</SplashSubtitle>
            </SplashBox>
        </SplashOverlay>
    );
};

export default SplashScreen;
