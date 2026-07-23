import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { ChevronDown } from "react-feather";

const Wrapper = styled.div`
  width: 100%;
  position: relative;
`;

const SelectedBox = styled.button`
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border-radius: 13px;
  border: 1px solid var(--porty-border);
  background: var(--porty-surface-soft);
  color: var(--porty-text);
  font-size: 15px;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: space-between;

  transition: 0.2s ease;

  &:hover {
    border-color: var(--porty-primary);
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  background: var(--porty-surface);
  border: 1px solid var(--porty-border);
  border-radius: 13px;
  box-shadow: var(--porty-shadow);
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

const Option = styled.button`
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  border: 0;
  background: transparent;
  color: var(--porty-text);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--porty-primary-soft);
  }
`;

const Arrow = styled(ChevronDown)`
  font-size: 0.9rem;
  color: var(--porty-subtext);
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
            <SelectedBox
                type="button"
                onClick={() => setOpen(!open)}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span>{value}</span>
                <Arrow />
            </SelectedBox>

            {open && (
                <Dropdown role="listbox">
                    {options.map((item) => (
                        <Option
                            type="button"
                            key={item}
                            role="option"
                            aria-selected={item === value}
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
