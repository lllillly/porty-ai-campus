import React, { useState } from "react";
import { Settings, Sun } from "react-feather";
import {
    FloatingArea,
    FabButton,
    OptionButtons,
    OptionFab,
} from "../styles/ChatPage.styles";

const FloatingMenu = ({ onOpenDarkMode, onOpenDietSettings, isDark }) => {
    const [open, setOpen] = useState(false);

    return (
        <FloatingArea>
            <OptionButtons $open={open}>
                <OptionFab
                    $isDark={isDark}
                    $open={open}
                    onClick={onOpenDarkMode}
                >
                    <Sun size={19} />
                </OptionFab>

                <OptionFab
                    $isDark={isDark}
                    $open={open}
                    onClick={onOpenDietSettings}
                >
                    <Settings size={19} />
                </OptionFab>
            </OptionButtons>

            <FabButton $isDark={isDark} onClick={() => setOpen(!open)}>
                +
            </FabButton>
        </FloatingArea>
    );
};

export default FloatingMenu;
