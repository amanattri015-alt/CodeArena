import Editor from "@monaco-editor/react";

function CodeEditor({
    language,
    value,
    onChange,
    onReset,
}) {
    const getMonacoLanguage = () => {
        switch (language?.toLowerCase()) {
            case "c++":
                return "cpp";

            case "javascript":
                return "javascript";

            case "java":
                return "java";

            case "python":
                return "python";

            default:
                return "plaintext";
        }
    };

    return (
        <div className="flex h-full min-h-0 flex-col bg-[#1e1e1e]">

            {/* ================= EDITOR HEADER ================= */}

            <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#333] bg-[#181818] px-4">

                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span className="h-3 w-3 rounded-full bg-green-500" />

                    <span className="ml-2 text-sm text-gray-300">
                        solution.cpp
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={onReset}
                        className="text-sm text-gray-400 hover:text-white"
                    >
                        Reset
                    </button>

                    <button
                        className="text-sm text-gray-400 hover:text-white"
                        onClick={() => {
                            const element =
                                document.documentElement;

                            if (!document.fullscreenElement) {
                                element.requestFullscreen?.();
                            } else {
                                document.exitFullscreen?.();
                            }
                        }}
                    >
                        Fullscreen
                    </button>
                </div>
            </div>

            {/* ================= MONACO ================= */}

            <div className="min-h-0 flex-1 overflow-hidden">
                <Editor
                    height="100%"
                    width="100%"
                    language={getMonacoLanguage()}
                    value={value}
                    onChange={(newValue) =>
                        onChange(newValue || "")
                    }
                    theme="vs-dark"
                    options={{
                        automaticLayout: true,
                        minimap: {
                            enabled: false,
                        },
                        fontSize: 14,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        padding: {
                            top: 12,
                        },
                    }}
                />
            </div>
        </div>
    );
}

export default CodeEditor;