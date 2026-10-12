import { useState } from "react";

import axiosClient from "../../utils/axiosClient";
import AIMessage from "./AIMessage";

function AIChatWindow({
    onClose,
    onMinimize,
    messages,
    setMessages,
    problem,
    code,
    language,
}) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        const question = message.trim();

        if (!question || loading) return;

        const userMessage = {
            id: Date.now(),
            role: "user",
            content: question,
        };

        setMessages((prev) => [
            ...prev,
            userMessage,
        ]);

        setMessage("");
        setLoading(true);

        try {
            const response = await axiosClient.post(
                "/ai/chat",
                {
                    question,
                    problem: problem?.description,
                    code,
                    language,
                }
            );

            const aiMessage = {
                id: Date.now() + 1,
                role: "assistant",
                content:
                    response.data?.reply ||
                    "I couldn't generate a response.",
            };

            setMessages((prev) => [
                ...prev,
                aiMessage,
            ]);
        } catch (error) {
            console.error(
                "CodeArena AI Error:",
                error
            );

            const errorMessage = {
                id: Date.now() + 1,
                role: "assistant",
                content:
                    error.response?.data?.message ||
                    "Something went wrong. Please try again.",
            };

            setMessages((prev) => [
                ...prev,
                errorMessage,
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <div
            className="
                codearena-ai-window
                fixed
                bottom-[88px]
                right-6
                z-[100]
                flex
                h-[min(680px,calc(100vh-140px))]
                w-[min(420px,calc(100vw-32px))]
                min-w-[320px]
                min-h-[400px]
                max-h-[calc(100vh-100px)]
                flex-col
                overflow-hidden
                resize
                rounded-2xl
                border
                border-base-300
                bg-base-100
                shadow-2xl
                animate-[aiSlideUp_0.2s_ease-out]
            "
        >
            {/* Header */}
            <div
                className="
                    flex
                    shrink-0
                    items-center
                    justify-between
                    border-b
                    border-base-300
                    bg-base-100
                    px-4
                    py-3
                "
            >
                <div className="flex items-center gap-3">
                    <div
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            bg-primary/10
                            text-lg
                        "
                    >
                        🤖
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold">
                                CodeArena AI
                            </h3>

                            <span
                                className="
                                    h-2
                                    w-2
                                    rounded-full
                                    bg-success
                                "
                            />
                        </div>

                        <p className="text-[11px] text-base-content/50">
                            Your coding assistant
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* Minimize */}
                    <button
                        type="button"
                        onClick={onMinimize}
                        title="Minimize"
                        className="
                            btn
                            btn-sm
                            btn-circle
                            btn-ghost
                        "
                    >
                        −
                    </button>

                    {/* Close */}
                    <button
                        type="button"
                        onClick={onClose}
                        title="Close"
                        className="
                            btn
                            btn-sm
                            btn-circle
                            btn-ghost
                        "
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Context indicator */}
            <div
                className="
                    flex
                    shrink-0
                    items-center
                    gap-2
                    border-b
                    border-base-300
                    bg-base-200/50
                    px-4
                    py-2
                    text-[11px]
                    text-base-content/50
                "
            >
                <span>●</span>

                <span className="truncate">
                    {problem?.title
                        ? `Helping with ${problem.title}`
                        : "Coding assistant"}
                </span>

                {language && (
                    <span className="ml-auto rounded-md bg-base-300 px-2 py-1">
                        {language}
                    </span>
                )}
            </div>

            {/* Messages */}
            <div
                className="
                    flex-1
                    space-y-4
                    overflow-y-auto
                    p-4
                    scrollbar-thin
                "
            >
                {messages.map((item) => (
                    <AIMessage
                        key={item.id}
                        message={item}
                    />
                ))}

                {/* Loading */}
                {loading && (
                    <div className="flex justify-start">
                        <div
                            className="
                                rounded-2xl
                                rounded-bl-md
                                border
                                border-base-300
                                bg-base-200
                                px-4
                                py-3
                            "
                        >
                            <div className="flex items-center gap-1">
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-base-content/40" />
                                <span
                                    className="
                                        h-1.5
                                        w-1.5
                                        animate-bounce
                                        rounded-full
                                        bg-base-content/40
                                        [animation-delay:150ms]
                                    "
                                />
                                <span
                                    className="
                                        h-1.5
                                        w-1.5
                                        animate-bounce
                                        rounded-full
                                        bg-base-content/40
                                        [animation-delay:300ms]
                                    "
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div
                className="
                    shrink-0
                    border-t
                    border-base-300
                    bg-base-100
                    p-3
                "
            >
                <div
                    className="
                        flex
                        items-end
                        gap-2
                        rounded-xl
                        border
                        border-base-300
                        bg-base-200
                        p-1.5
                        transition-colors
                        focus-within:border-primary
                    "
                >
                    <textarea
                        value={message}
                        onChange={(event) =>
                            setMessage(
                                event.target.value
                            )
                        }
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about this problem..."
                        rows={1}
                        disabled={loading}
                        className="
                            textarea
                            textarea-ghost
                            min-h-[42px]
                            max-h-[120px]
                            flex-1
                            resize-none
                            bg-transparent
                            px-2
                            text-sm
                            focus:outline-none
                        "
                    />

                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={
                            !message.trim() ||
                            loading
                        }
                        className="
                            btn
                            btn-primary
                            btn-sm
                            h-10
                            min-h-10
                            w-10
                            px-0
                        "
                    >
                        {loading ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            "➤"
                        )}
                    </button>
                </div>

                <p className="mt-2 text-center text-[10px] text-base-content/40">
                    Enter to send • Shift + Enter for new line
                </p>
            </div>
        </div>
    );
}

export default AIChatWindow;