import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { ChevronDown } from "react-feather";

const Wrapper = styled.div`
  width: 100%;
  position: relative;
`;

const SelectedBox = styled.div`
  width: 90%;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 1.4px solid #d5d9e2;
  background: #f9fbff;
  color: #333;
  font-size: 1rem;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: space-between;

  transition: 0.2s ease;

  &:hover {
    border-color: #9DABCF;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  background: #ffffff;
  border: 1.3px solid #d8dce7;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  z-index: 3000;

  max-height: 220px;
  overflow-y: auto;
  animation: fadeIn 0.15s ease;

  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: translateY(4px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Option = styled.div`
  padding: 0.85rem 1rem;
  font-size: 0.97rem;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #f0f4ff;
  }
`;

const Arrow = styled(ChevronDown)`
  font-size: 0.9rem;
  color: #7a859d;
`;

const CustomSelect = ({ value, onChange, options }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    // Dropdown 외부 클릭 시 닫기
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <Wrapper ref={ref}>
            <SelectedBox onClick={() => setOpen(!open)}>
                <span>{value}</span>
                <Arrow />
            </SelectedBox>

            {open && (
                <Dropdown>
                    {options.map((item) => (
                        <Option
                            key={item}
                            onClick={() => {
                                onChange(item);
                                setOpen(false);
                            }}
                        >
                            {item}
                        </Option>
                    ))}
                </Dropdown>
            )}
        </Wrapper>
    );
};

export default CustomSelect;
