// Keep both existing API route families on the same optimized execution logic.
// The canonical run/submit implementation lives in userProblem.js.
const { runCode, submitCode } = require("./userProblem");

module.exports = { runCode, submitCode };
