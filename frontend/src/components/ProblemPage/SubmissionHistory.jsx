import { useEffect, useState } from "react";
import axiosClient from "../../utils/axiosClient";

function SubmissionHistory({ problemId }) {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await axiosClient.get(
                        `/problem/submissions/${problemId}`
                    );

                const data = response.data;

                setSubmissions(
                    Array.isArray(data)
                        ? data
                        : data.submissions || []
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        "Unable to load submissions"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [problemId]);

    // ================= LOADING =================

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">

                <span className="loading loading-spinner loading-lg" />

            </div>
        );
    }

    // ================= ERROR =================

    if (error) {
        return (
            <div className="p-6">

                <div className="rounded-xl border border-error/30 bg-error/10 p-5">

                    <h3 className="font-bold text-error">
                        Unable to load submissions
                    </h3>

                    <p className="mt-2 text-sm text-error/80">
                        {error}
                    </p>

                </div>

            </div>
        );
    }

    // ================= EMPTY =================

    if (submissions.length === 0) {
        return (
            <div className="flex h-full items-center justify-center p-8">

                <div className="text-center">

                    <div className="text-4xl">
                        📝
                    </div>

                    <h3 className="mt-4 text-lg font-bold">
                        No submissions yet
                    </h3>

                    <p className="mt-2 text-sm text-base-content/50">
                        Your submissions for this problem
                        will appear here.
                    </p>

                </div>

            </div>
        );
    }

    // ================= SUBMISSIONS =================

    return (
        <div className="h-full overflow-y-auto px-6 py-6">

            <div className="mx-auto max-w-5xl">

                <div className="mb-6">
                    <h2 className="text-2xl font-bold">
                        Submissions
                    </h2>

                    <p className="mt-1 text-sm text-base-content/50">
                        Your submission history for this problem
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-base-300">

                    {/* Header */}

                    <div className="grid grid-cols-5 gap-4 border-b border-base-300 bg-base-200 px-5 py-4 text-sm font-semibold">

                        <span>Status</span>
                        <span>Language</span>
                        <span>Test Cases</span>
                        <span>Runtime</span>
                        <span>Date</span>

                    </div>

                    {/* Rows */}

                    {submissions.map((submission) => {

                        const isAccepted =
                            submission.status ===
                            "Accepted";

                        return (
                            <div
                                key={submission._id}
                                className="grid grid-cols-5 gap-4 border-b border-base-300 px-5 py-4 text-sm last:border-b-0"
                            >

                                {/* Status */}

                                <div>
                                    <span
                                        className={`font-semibold ${
                                            isAccepted
                                                ? "text-success"
                                                : "text-error"
                                        }`}
                                    >
                                        {isAccepted
                                            ? "✓ Accepted"
                                            : `✕ ${submission.status}`}
                                    </span>
                                </div>

                                {/* Language */}

                                <div className="text-base-content/70">
                                    {submission.language}
                                </div>

                                {/* Test cases */}

                                <div className="text-base-content/70">
                                    {submission.testCasesPassed}
                                    /
                                    {submission.totalTestCases}
                                </div>

                                {/* Runtime */}

                                <div className="text-base-content/70">
                                    {submission.runtime ?? 0}
                                </div>

                                {/* Date */}

                                <div className="text-base-content/60">
                                    {submission.createdAt
                                        ? new Date(
                                              submission.createdAt
                                          ).toLocaleString()
                                        : "-"}
                                </div>

                            </div>
                        );
                    })}

                </div>

            </div>

        </div>
    );
}

export default SubmissionHistory;