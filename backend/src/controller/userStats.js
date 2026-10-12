const User = require("../model/user");
const Submission = require("../model/submission");

const getUserStats = async (req, res) => {
    try {
        const userId = req.result._id;

        const [user, attemptedProblems, acceptedProblems, acceptedSubmissions] =
            await Promise.all([
                User.findById(userId).select("problemSolved"),

                Submission.distinct("problemId", {
                    userId,
                }),

                Submission.distinct("problemId", {
                    userId,
                    status: "Accepted",
                }),

                Submission.find({
                    userId,
                    status: "Accepted",
                })
                    .select("createdAt")
                    .sort({ createdAt: -1 }),
            ]);

        const attempted = attemptedProblems.length;
        const solved = user?.problemSolved?.length || 0;

        // Unique attempted problems -> unique solved problems
        const successRate = attempted
            ? Number(((acceptedProblems.length / attempted) * 100).toFixed(1))
            : 0;

        const currentStreak = calculateStreak(acceptedSubmissions);

        return res.status(200).json({
            stats: {
                attempted,
                solved,
                successRate,
                currentStreak,
            },
        });
    } catch (error) {
        console.error("User stats error:", error);

        return res.status(500).json({
            message: "Unable to fetch user statistics",
        });
    }
};

function calculateStreak(submissions) {
    if (!submissions.length) return 0;

    const dates = [
        ...new Set(
            submissions.map((submission) =>
                new Date(submission.createdAt)
                    .toISOString()
                    .split("T")[0]
            )
        ),
    ];

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < dates.length; i++) {
        const expectedDate = new Date(today);

        expectedDate.setDate(
            today.getDate() - i
        );

        const expected = expectedDate
            .toISOString()
            .split("T")[0];

        if (dates.includes(expected)) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

module.exports = getUserStats;