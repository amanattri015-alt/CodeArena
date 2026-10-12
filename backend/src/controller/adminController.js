const User = require("../model/user");
const Problem = require("../model/problem");
const Submission = require("../model/submission");

const publicUser = (u) => ({
    _id: u._id,
    firstName: u.firstName,
    lastName: u.lastName,
    emailId: u.emailId,
    age: u.age,
    role: u.role,
    problemSolved: u.problemSolved || [],
    createdAt: u.createdAt,
    updatedAt: u.updatedAt
});

const dashboard = async (req, res) => {
    try {
        const [totalUsers,totalProblems,totalSubmissions,acceptedSubmissions,easyProblems,mediumProblems,hardProblems,recentUsers,recentProblems,recentSubmissions] = await Promise.all([
            User.countDocuments(),
            Problem.countDocuments(),
            Submission.countDocuments(),
            Submission.countDocuments({ status: "Accepted" }),
            Problem.countDocuments({ difficulty: "easy" }),
            Problem.countDocuments({ difficulty: "medium" }),
            Problem.countDocuments({ difficulty: "hard" }),
            User.find({}).select("firstName lastName emailId role problemSolved createdAt").sort({ createdAt: -1 }).limit(6),
            Problem.find({}).select("_id title difficulty tags createdAt updatedAt").sort({ createdAt: -1 }).limit(6),
            Submission.find({}).select("_id userId problemId language status runtime memory testCasesPassed totalTestCases createdAt").populate("userId","firstName lastName emailId").populate("problemId","title").sort({ createdAt: -1 }).limit(8)
        ]);
        return res.json({
            stats: {
                totalUsers,totalProblems,totalSubmissions,acceptedSubmissions,
                failedSubmissions: totalSubmissions - acceptedSubmissions,
                easyProblems,mediumProblems,hardProblems
            },
            recentUsers,
            recentProblems,
            recentSubmissions
        });
    } catch (err) {
        return res.status(500).json({ message: "Error loading admin dashboard", error: err.message });
    }
};

const getUsers = async (req,res) => {
    try {
        const { search="", role="" } = req.query;
        const filter = {};
        if (role && ["user","admin"].includes(role)) filter.role = role;
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { emailId: { $regex: search, $options: "i" } }
            ];
        }
        const users = await User.find(filter).select("-password").sort({ createdAt: -1 }).limit(200);
        return res.json({ users: users.map(publicUser) });
    } catch(err) {
        return res.status(500).json({ message: "Error fetching users", error: err.message });
    }
};

const getUser = async (req,res) => {
    try {
        const user = await User.findById(req.params.id).select("-password").populate("problemSolved","_id title difficulty tags");
        if (!user) return res.status(404).json({ message: "User not found" });
        const submissions = await Submission.find({ userId: user._id })
            .select("_id problemId language status runtime memory testCasesPassed totalTestCases createdAt")
            .populate("problemId","_id title difficulty tags")
            .sort({ createdAt: -1 }).limit(100);
        return res.json({ user: publicUser(user), submissions });
    } catch(err) {
        return res.status(500).json({ message: "Error fetching user", error: err.message });
    }
};

const deleteUser = async (req,res) => {
    try {
        if (String(req.params.id) === String(req.result._id)) return res.status(400).json({ message: "You cannot delete your own admin account" });
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role === "admin") return res.status(403).json({ message: "Admin accounts cannot be deleted from this panel" });
        await Submission.deleteMany({ userId: user._id });
        await User.findByIdAndDelete(user._id);
        return res.json({ message: "User deleted successfully" });
    } catch(err) {
        return res.status(500).json({ message: "Error deleting user", error: err.message });
    }
};

const getSubmissions = async (req,res) => {
    try {
        const { status="", language="", search="" } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (language) filter.language = language;
        const query = Submission.find(filter)
            .select("_id userId problemId code language status runtime memory testCasesPassed totalTestCases createdAt updatedAt")
            .populate("userId","firstName lastName emailId")
            .populate("problemId","_id title difficulty tags")
            .sort({ createdAt: -1 }).limit(300);
        let submissions = await query;
        if (search) {
            const q = search.toLowerCase();
            submissions = submissions.filter(s =>
                s.userId?.emailId?.toLowerCase().includes(q) ||
                s.userId?.firstName?.toLowerCase().includes(q) ||
                s.problemId?.title?.toLowerCase().includes(q)
            );
        }
        return res.json({ submissions });
    } catch(err) {
        return res.status(500).json({ message: "Error fetching submissions", error: err.message });
    }
};


const getProblem = async (req,res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ message: "Problem not found" });
        return res.json({ problem });
    } catch(err) {
        return res.status(500).json({ message: "Error fetching problem", error: err.message });
    }
};

const getSubmission = async (req,res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate("userId","firstName lastName emailId role")
            .populate("problemId","_id title difficulty tags");
        if (!submission) return res.status(404).json({ message: "Submission not found" });
        return res.json({ submission });
    } catch(err) {
        return res.status(500).json({ message: "Error fetching submission", error: err.message });
    }
};

module.exports = { dashboard, getUsers, getUser, deleteUser, getSubmissions, getSubmission, getProblem };
