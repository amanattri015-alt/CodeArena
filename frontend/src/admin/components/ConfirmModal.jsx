function ConfirmModal({ open, title, message, confirmText = "Delete", onConfirm, onCancel, loading }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-base-100 p-6 shadow-2xl">
                <h3 className="text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/60">{message}</p>
                <div className="mt-6 flex justify-end gap-2">
                    <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>Cancel</button>
                    <button className="btn btn-error" onClick={onConfirm} disabled={loading}>
                        {loading ? <span className="loading loading-spinner loading-sm" /> : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
export default ConfirmModal;
