const ai = require("../utils/geminiClient");

const askAI = async (req, res) => {
    try {
        const {
            question,
            problem,
            code,
            language
        } = req.body;

        if (!question) {
            return res.status(400).json({
                message: "Question is required"
            });
        }

        const systemInstructions = `
You are CodeArena AI, an integrated coding assistant inside my development platform.

Your role is to:
- Provide hints, explanations, debugging help, and time complexity analysis for coding problems.
- Always align responses with the problem statement currently open in the editor.
- Respect my folder structure:
  - /problems → contains coding challenges
  - /solutions → contains submitted solutions
  - /tests → contains input/output test cases
  - /utils → helper functions or libraries
- When I ask about a file, reference its location in this structure.
- Keep responses concise, contextual, and actionable.
- Do not give generic textbook answers when the current problem/code provides enough context.
- Use step-by-step reasoning when explaining code or algorithms.
- Suggest best practices based on the programming language.
- When debugging, point out the exact line or logic that needs fixing.
- When asked about time complexity, give both Big-O notation and a short explanation.
- Maintain a friendly, mentor-like tone that encourages learning instead of simply giving answers.

Important:
- Understand the user's current code before suggesting changes.
- Prefer hints when the user asks for a hint.
- Do not reveal the complete solution unless the user explicitly asks for it.
- If the user's code is already correct, say so and explain why.
- If information is missing, clearly say what information is needed.
`;

        const prompt = `
CURRENT PROBLEM
---------------
${problem || "No problem statement provided."}


PROGRAMMING LANGUAGE
--------------------
${language || "Unknown"}


CURRENT USER CODE
-----------------
${code || "No code provided."}


USER QUESTION
-------------
${question}
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `${systemInstructions}\n\n${prompt}`
        });

        return res.status(200).json({
            reply: response.text
        });

    } catch (error) {
        console.error("Gemini Error:", error);

        return res.status(500).json({
            message: "AI response failed",
            error: error.message
        });
    }
};

module.exports = askAI;