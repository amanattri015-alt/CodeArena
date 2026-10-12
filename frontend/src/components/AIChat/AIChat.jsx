import { useState } from "react";

import AIChatButton from "./AIChatButton";
import AIChatWindow from "./AIChatWindow";

function AIChat({ problem, code, language }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    const [messages, setMessages] = useState([
        {
            id: 1,
            role: "assistant",
            content:
                "Hi 👋 I’m CodeArena AI. I can help with hints, debugging, explanations, and time complexity.",
        },
    ]);

    const handleOpen = () => {
        setIsOpen(true);
        setIsMinimized(false);
    };

    const handleClose = () => {
        setIsOpen(false);
        setIsMinimized(false);
    };

    const handleMinimize = () => {
        setIsMinimized((prev) => !prev);
    };

    return (
        <>
            {/* Floating button */}
            {(!isOpen || isMinimized) && (
                <AIChatButton
                    onClick={handleOpen}
                    minimized={isMinimized}
                />
            )}

            {/* Chat window */}
            {isOpen && !isMinimized && (
                <AIChatWindow
                    onClose={handleClose}
                    onMinimize={handleMinimize}
                    messages={messages}
                    setMessages={setMessages}
                    problem={problem}
                    code={code}
                    language={language}
                />
            )}
        </>
    );
}

export default AIChat;