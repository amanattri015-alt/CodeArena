const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const User = require("../model/user");

const userMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).send("Token doesn't exist");
        }

        const payload = jwt.verify(token, process.env.JWT_KEY);

        if (!payload || !payload.exp) {
            return res.status(401).send("Invalid token");
        }

        const { _id } = payload;

        const result = await User.findById(_id);

        if (!result) {
            return res.status(400).send("User does not exist");
        }

        const isBlocked = await redisClient.exists(`token:${token}`);

        if (isBlocked) {
            return res.status(401).send("Token is blocked");
        }

        req.result = result;

        next();

    } catch (err) {
        console.log("Auth Error:", err.message);
        return res.status(401).send("Invalid or expired token");
    }
};

module.exports = userMiddleware;