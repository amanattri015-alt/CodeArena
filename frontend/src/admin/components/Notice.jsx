export function ErrorState({ message, onRetry }) {
    return (
        <div className="rounded-2xl border border-error/20 bg-error/5 p-8 text-center">
            <h3 className="font-bold text-error">Something went wrong</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-base-content/60">{message}</p>
            {onRetry && <button className="btn btn-sm btn-outline mt-4" onClick={onRetry}>Retry</button>}
        </div>
    );
}
export function EmptyState({ title = "Nothing here yet", message = "No records match your current filters." }) {
    return (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-12 text-center">
            <h3 className="font-bold">{title}</h3>
            <p className="mt-2 text-sm text-base-content/50">{message}</p>
        </div>
    );
}
export function Skeleton({ className = "h-24" }) {
    return <div className={`animate-pulse rounded-2xl bg-base-300/70 ${className}`} />;
}
