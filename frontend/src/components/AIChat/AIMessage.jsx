function renderMessageContent(content) {
    if (!content) return null;

    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
            const code = part
                .replace(/^```[a-zA-Z0-9+#.-]*\n?/, "")
                .replace(/```$/, "")
                .trim();

            return (
                <pre
                    key={index}
                    className="
                        my-3
                        overflow-x-auto
                        rounded-lg
                        border
                        border-base-300
                        bg-base-300
                        p-3
                        text-xs
                        leading-5
                    "
                >
                    <code>{code}</code>
                </pre>
            );
        }

        return (
            <span
                key={index}
                className="whitespace-pre-wrap"
            >
                {part}
            </span>
        );
    });
}

function AIMessage({ message }) {
    const isUser = message.role === "user";

    return (
        <div
            className={`flex ${
                isUser
                    ? "justify-end"
                    : "justify-start"
            }`}
        >
            <div
                className={`
                    max-w-[88%]
                    rounded-2xl
                    px-4
                    py-3
                    text-sm
                    leading-6
                    ${
                        isUser
                            ? "rounded-br-md bg-primary text-primary-content"
                            : "rounded-bl-md border border-base-300 bg-base-200 text-base-content"
                    }
                `}
            >
                {!isUser && (
                    <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-sm">
                            🤖
                        </span>

                        <span className="text-xs font-semibold text-primary">
                            CodeArena AI
                        </span>
                    </div>
                )}

                <div>
                    {renderMessageContent(message.content)}
                </div>
            </div>
        </div>
    );
}

export default AIMessage;