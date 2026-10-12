function LoadingSkeleton() {
    return (
        <div className="flex min-h-[500px] w-full items-center justify-center">
            <div className="w-full max-w-4xl space-y-4 px-6">
                
                <div className="skeleton h-10 w-64" />

                <div className="skeleton h-5 w-96 max-w-full" />

                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="skeleton h-16" />
                    <div className="skeleton h-16" />
                    <div className="skeleton h-16" />
                </div>

                <div className="skeleton h-16 w-full" />

                {Array.from({ length: 7 }).map((_, index) => (
                    <div
                        key={index}
                        className="skeleton h-16 w-full"
                    />
                ))}
            </div>
        </div>
    );
}

export default LoadingSkeleton;