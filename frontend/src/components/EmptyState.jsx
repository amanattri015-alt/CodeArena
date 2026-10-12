function EmptyState({ onReset }) {
    return (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 px-6 py-16 text-center">

            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-base-200 text-base-content/40">

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle
                        cx="11"
                        cy="11"
                        r="8"
                    />

                    <path d="m21 21-4.3-4.3" />
                </svg>

            </div>


            <h3 className="mt-4 text-lg font-bold">
                No problems found
            </h3>


            <p className="mt-1 text-sm text-base-content/55">
                Try changing your search or filters.
            </p>


            <button
                onClick={onReset}
                className="btn btn-primary btn-sm mt-5"
            >
                Reset Filters
            </button>

        </div>
    );
}

export default EmptyState;