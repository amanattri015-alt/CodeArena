const express = require("express");
const askAI = require("../controller/aiController");

const aiRouter = express.Router();

aiRouter.post("/chat", askAI);

module.exports = aiRouter;