const express = require("express");
const getUserStats = require("../controller/userStats");
const problemRouter = express.Router();

const {
    createProblem,
    updateProblem,
    deleteProblem,
    getAllProblem,
    getProblemById,
    solvedAllProblemByUser,
    runCode,
    submitCode,
     getAcceptedSolution,
     submittedProblem,
     
} = require("../controller/userProblem");

const adminMiddleware = require("../middleware/adminMiddlware");
const userMiddleware = require("../middleware/userMiddleware");

// Admin
problemRouter.post(
    "/create",
    adminMiddleware,
    createProblem
);

problemRouter.patch(
    "/update/:id",
    adminMiddleware,
    updateProblem
);

problemRouter.delete(
    "/delete/:id",
    adminMiddleware,
    deleteProblem
);

// User
problemRouter.get(
    "/getAllProblem",
    userMiddleware,
    getAllProblem
);

problemRouter.get(
    "/problemById/:id",
    userMiddleware,
    getProblemById
);

problemRouter.get(
    "/problemSolvedByUser",
    userMiddleware,
    solvedAllProblemByUser
);

// Code execution
problemRouter.post(
    "/run/:id",
    userMiddleware,
    runCode
);

problemRouter.post(
    "/submit/:id",
    userMiddleware,
    submitCode
);

problemRouter.get(
    "/acceptedSolution/:pid",
    userMiddleware,
    getAcceptedSolution
);

problemRouter.get(
    "/submissions/:pid",
    userMiddleware,
    submittedProblem
);

problemRouter.get(
    "/stats",
    userMiddleware,
    getUserStats
);

module.exports = problemRouter;