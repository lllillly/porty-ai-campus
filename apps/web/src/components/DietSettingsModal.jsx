import React, { useEffect, useState } from "react";

import CustomSelect from "./CustomSelect";
import {
  DeleteButton,
  Label,
  ModalBackdrop,
  ModalContainer,
  ModalTitle,
  SaveButton,
} from "../styles/ModalStyles";

const DEFAULT_CAMPUS = "공주";
const DEFAULT_PLACE = "기숙사";

const dormOptions = {
  공주: ["은행사/홍익사/해오름집", "비전/블룸하우스", "드림하우스"],
  천안: ["천안 기숙사"],
  예산: ["예산 기숙사"],
};

const DietSettingsModal = ({ onClose, onSave, onDelete }) => {
  const [campus, setCampus] = useState(DEFAULT_CAMPUS);
  const [place, setPlace] = useState(DEFAULT_PLACE);
  const [dorm, setDorm] = useState(dormOptions[DEFAULT_CAMPUS][0]);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("diet_settings");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      const savedCampus = dormOptions[parsed.campus]
        ? parsed.campus
        : DEFAULT_CAMPUS;
      const savedPlace =
        parsed.place === "학생식당" ? "학생식당" : DEFAULT_PLACE;
      const availableDorms = dormOptions[savedCampus];
      const savedDorm = availableDorms.includes(parsed.dorm)
        ? parsed.dorm
        : availableDorms[0];

      setCampus(savedCampus);
      setPlace(savedPlace);
      setDorm(savedDorm);
      setHasSaved(true);
    } catch {
      setHasSaved(false);
    }
  }, []);

  const handleCampusChange = (nextCampus) => {
    setCampus(nextCampus);
    if (place === DEFAULT_PLACE) {
      setDorm(dormOptions[nextCampus][0]);
    }
  };

  const handlePlaceChange = (nextPlace) => {
    setPlace(nextPlace);
    if (nextPlace === DEFAULT_PLACE) {
      setDorm(dormOptions[campus][0]);
    }
  };

  const handleSave = () => {
    const settings = { campus, place, dorm };
    localStorage.setItem("diet_settings", JSON.stringify(settings));
    onSave?.(settings);
    onClose();
  };

  const handleDelete = () => {
    localStorage.removeItem("diet_settings");
    setHasSaved(false);
    onDelete?.();
    onClose();
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer onClick={(event) => event.stopPropagation()}>
        <ModalTitle>식단표 설정</ModalTitle>

        <Label>캠퍼스 선택</Label>
        <CustomSelect
          value={campus}
          onChange={handleCampusChange}
          options={Object.keys(dormOptions)}
        />

        <Label>식사 장소</Label>
        <CustomSelect
          value={place}
          onChange={handlePlaceChange}
          options={["기숙사", "학생식당"]}
        />

        {place === DEFAULT_PLACE && (
          <>
            <Label>기숙사 선택</Label>
            <CustomSelect
              value={dorm}
              onChange={setDorm}
              options={dormOptions[campus]}
            />
          </>
        )}

        <SaveButton type="button" onClick={handleSave}>
          저장
        </SaveButton>
        {hasSaved && (
          <DeleteButton type="button" onClick={handleDelete}>
            삭제
          </DeleteButton>
        )}
      </ModalContainer>
    </ModalBackdrop>
  );
};

export default DietSettingsModal;
