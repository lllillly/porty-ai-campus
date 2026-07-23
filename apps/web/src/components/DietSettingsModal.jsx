import React, { useState, useEffect } from "react";
import {
    ModalBackdrop,
    ModalContainer,
    ModalTitle,
    Label,
    SaveButton,
    DeleteButton
} from "../styles/ModalStyles";

import CustomSelect from "../components/CustomSelect";

const dormOptions = {
    공주: ["은행사/홍익사/해오름집", "비전/블룸하우스", "드림하우스"],
    천안: ["천안 기숙사"],
    예산: ["예산 기숙사"],
};

const DietSettingsModal = ({ onClose, onSave, onDelete }) => {
    const [campus, setCampus] = useState("공주");
    const [place, setPlace] = useState("기숙사");
    const [dorm, setDorm] = useState(dormOptions["공주"][0]);
    const [notify, setNotify] = useState(true);
    const [hasSaved, setHasSaved] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("diet_settings");
        if (saved) {
            const parsed = JSON.parse(saved);
            setCampus(parsed.campus || "공주");
            setPlace(parsed.place || "기숙사");
            setDorm(parsed.dorm || dormOptions[parsed.campus || "공주"][0]);
            setNotify(parsed.notify ?? true);
            setHasSaved(true);
        }
    }, []);

    useEffect(() => {
        if (place === "기숙사") {
            setDorm(dormOptions[campus][0]);
        }
    }, [campus, place]);

    const handleSave = () => {
        const settings = { campus, place, dorm, notify };
        localStorage.setItem("diet_settings", JSON.stringify(settings));
        onSave && onSave(settings);
        onClose();
    };

    const handleDelete = () => {
        localStorage.removeItem("diet_settings");
        setHasSaved(false);
        onDelete && onDelete();
        onClose();
    };

    return (
        <ModalBackdrop onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalTitle>식단표 설정</ModalTitle>

                <Label>캠퍼스 선택</Label>
                <CustomSelect
                    value={campus}
                    onChange={(v) => setCampus(v)}
                    options={Object.keys(dormOptions)}
                />

                <Label>식사 장소</Label>
                <CustomSelect
                    value={place}
                    onChange={(v) => setPlace(v)}
                    options={["기숙사", "학생식당"]}
                />

                {place === "기숙사" && (
                    <>
                        <Label>기숙사 선택</Label>
                        <CustomSelect
                            value={dorm}
                            onChange={(v) => setDorm(v)}
                            options={dormOptions[campus]}
                        />
                    </>
                )}

                <SaveButton onClick={handleSave}>저장</SaveButton>
                {hasSaved && <DeleteButton onClick={handleDelete}>삭제</DeleteButton>}
            </ModalContainer>
        </ModalBackdrop>
    );
};

export default DietSettingsModal;
