function AIChatButton({ onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title="Open CodeArena AI"
            aria-label="Open CodeArena AI"
            className="
                group
                fixed
                bottom-[88px]
                right-6
                z-[100]
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                border
                border-primary/20
                bg-primary
                text-primary-content
                shadow-lg
                shadow-primary/20
                transition-all
                duration-200
                hover:-translate-y-1
                hover:shadow-xl
                hover:shadow-primary/30
                active:scale-95
            "
        >
            <span className="text-xl transition-transform duration-200 group-hover:scale-110">
                🤖
            </span>

            {/* Online indicator */}
            <span
                className="
                    absolute
                    right-0
                    top-0
                    h-3
                    w-3
                    rounded-full
                    border-2
                    border-base-100
                    bg-success
                "
            />
        </button>
    );
}

export default AIChatButton;