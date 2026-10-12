import { z } from "zod";

export const problemSchema = z.object({
    title: z
        .string()
        .min(3, "Title must contain at least 3 characters"),

    description: z
        .string()
        .min(10, "Description is too short"),

    difficulty: z.enum(["easy", "medium", "hard"]),

    tags: z.enum([
        "array",
        "string",
        "linked List",
        "dp",
        "graph",
        "tree",
    ]),

    editorial: z
        .string()
        .min(10, "Editorial should contain at least 10 characters"),

    visibleTestCases: z.array(
        z.object({
            input: z.string(),
            output: z.string(),
            explanation: z.string(),
        })
    ),

    hiddenTestCases: z.array(
        z.object({
            input: z.string(),
            output: z.string(),
        })
    ),

    startCode: z.array(
        z.object({
            language: z.string(),
            initialCode: z.string(),
        })
    ),

    referenceSolution: z.array(
        z.object({
            language: z.string(),
            completeSolution: z.string(),
        })
    ),
});

export const defaultValues = {
    title: "",
    description: "",
    difficulty: "easy",
    tags: "array",
    editorial: "",

    visibleTestCases: [
        {
            input: "",
            output: "",
            explanation: "",
        },
    ],

    hiddenTestCases: [
        {
            input: "",
            output: "",
        },
    ],

    startCode: [
        {
            language: "c++",
            initialCode: "",
        },
    ],

    referenceSolution: [
        {
            language: "c++",
            completeSolution: "",
        },
    ],
};

export const languageOptions = [
    { value: "c++", label: "C++" },
    { value: "java", label: "Java" },
    { value: "javascript", label: "JavaScript" },
];

export const difficultyOptions = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
];

export const tagOptions = [
    { value: "array", label: "Array" },
    { value: "string", label: "String" },
    { value: "linked List", label: "Linked List" },
    { value: "dp", label: "Dynamic Programming" },
    { value: "graph", label: "Graph" },
    { value: "tree", label: "Tree" },
];