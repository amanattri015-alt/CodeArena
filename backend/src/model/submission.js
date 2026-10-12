const mongoose = require("mongoose");

const { Schema } = mongoose;

const submissionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true
        },

        problemId: {
            type: Schema.Types.ObjectId,
            ref: "problem",
            required: true
        },

        code: {
            type: String,
            required: true
        },

        language: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: [
                "Accepted",
                "Wrong Answer",
                "Compilation Error",
                "Runtime Error",
                "Time Limit Exceeded",
                "pending"

            ],
            required: true
        },

        runtime: {
            type: Number,
            default: 0
        },

        memory: {
            type: Number,
            default: 0
        },

        testCasesPassed: {
            type: Number,
            default: 0
        },

        totalTestCases: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

//use the compound indexing for searching in O(n) TC
submissionSchema.index({userId:1,problemId:1});


const Submission = mongoose.model("submission", submissionSchema);

module.exports = Submission;