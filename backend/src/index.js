const express = require("express");
require("dotenv").config();

const cookieParser = require("cookie-parser");

const main = require("./config/db");
const redisClient = require("./config/redis");
const authRouter = require("./routes/userAuth");
const problemRouter = require("./routes/problemCreator");
const submitRouter=require("./routes/submit");
const adminRouter=require("./routes/admin");
const userMiddleware = require("./middleware/userMiddleware");
const adminMiddleware = require("./middleware/adminMiddlware");
const aiRouter = require("./router/aiRouter");


const cors=require("cors")
const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));



// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission",submitRouter);
app.use(
    "/admin",
    userMiddleware,
    adminMiddleware,
    adminRouter
);

//AI route
app.use("/ai", aiRouter);

// Initialize MongoDB → Redis → Server
const initializeConnection = async () => {
    try {
        // Connect MongoDB
        console.log("Connecting to MongoDB...");
        await main();
        console.log("MongoDB connected successfully");

        // Connect Redis
        console.log("Connecting to Redis...");
        await redisClient.connect();
        console.log("Redis connected successfully");

        // Start server
        app.listen(process.env.PORT, () => {
            console.log(`Listening at port ${process.env.PORT}`);
        });

    } catch (err) {
        console.error("Connection Error:", err.message);
    }
};

initializeConnection();