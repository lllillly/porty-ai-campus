import React from "react";
import { ToastContainer } from "../styles/ChatPage.styles";

const Toast = ({ message }) => {
    if (!message) return null;
    return <ToastContainer>{message}</ToastContainer>;
};

export default Toast;
