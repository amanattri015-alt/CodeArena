function ProblemTabs({ activeTab, setActiveTab }) {
    const tabs = [
        {
            id: "problem",
            label: "Problem",
        },
        {
            id: "editorial",
            label: "Editorial",
        },
        {
            id: "submissions",
            label: "Submissions",
        },
    ];

    return (
        <div className="border-b border-base-300 bg-base-100">
            <div className="flex">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-3 text-sm font-medium transition ${
                            activeTab === tab.id
                                ? "border-b-2 border-primary text-primary"
                                : "text-base-content/60 hover:text-base-content"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default ProblemTabs;