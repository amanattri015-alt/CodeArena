import Icon from "../../components/Icon";

const icons = {
    users: "users",
    problems: "code",
    submissions: "terminal",
    accepted: "check",
    easy: "spark",
    medium: "activity",
    hard: "alert",
};

function StatCard({ label, value, icon = "activity", hint }) {
    return (
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-base-content/55">{label}</p>
                    <p className="mt-2 text-3xl font-black tracking-tight">{value ?? "—"}</p>
                    {hint && <p className="mt-1 text-xs text-base-content/45">{hint}</p>}
                </div>
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon name={icons[icon] || icon} size={21} />
                </div>
            </div>
        </div>
    );
}
export default StatCard;
