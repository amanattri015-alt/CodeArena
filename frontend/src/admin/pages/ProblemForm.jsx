import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import { adminApi } from "../services/adminApi";
import { ErrorState, Skeleton } from "../components/Notice";
import DynamicFieldArray from "../components/DynamicFieldArray";

import {
    problemSchema,
    defaultValues,
    difficultyOptions,
    tagOptions,
} from "../config/problemForm.config";

function ProblemForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const {
        register,
        control,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(problemSchema),
        defaultValues,
    });

    // -----------------------------
    // Load problem for edit
    // -----------------------------
    useEffect(() => {
        if (!isEdit) return;

        const loadProblem = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await adminApi.problem(id);
                const problem = response.data?.problem;

                if (!problem) {
                    throw new Error("Problem not found");
                }

                reset({
                    ...defaultValues,

                    title: problem.title || "",
                    description: problem.description || "",
                    difficulty: problem.difficulty || "easy",
                    tags: problem.tags || "array",
                    editorial: problem.editorial || "",

                    visibleTestCases:
                        problem.visibleTestCases?.length
                            ? problem.visibleTestCases
                            : defaultValues.visibleTestCases,

                    hiddenTestCases:
                        problem.hiddenTestCases?.length
                            ? problem.hiddenTestCases
                            : defaultValues.hiddenTestCases,

                    startCode:
                        problem.startCode?.length
                            ? problem.startCode
                            : defaultValues.startCode,

                    referenceSolution:
                        problem.referenceSolution?.length
                            ? problem.referenceSolution
                            : defaultValues.referenceSolution,
                });
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        err.response?.data ||
                        err.message ||
                        "Unable to load problem"
                );
            } finally {
                setLoading(false);
            }
        };

        loadProblem();
    }, [id, isEdit, reset]);

    // -----------------------------
    // Submit
    // -----------------------------
    const onSubmit = async (data) => {
        try {
            setSaving(true);
            setError("");

            if (isEdit) {
                await adminApi.updateProblem(id, data);
            } else {
                await adminApi.createProblem(data);
            }

            navigate("/admin/problems");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    err.response?.data ||
                    "Unable to save problem"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Skeleton className="h-[700px]" />;
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
        >
            {/* Header */}
            <FormHeader
                isEdit={isEdit}
                saving={saving}
                onBack={() => navigate("/admin/problems")}
            />

            {/* Error */}
            {error && <ErrorState message={error} />}

            {/* Basic Information */}
            <BasicInformation
                register={register}
                errors={errors}
            />

            {/* Editorial */}
            <Editorial
                register={register}
                error={errors.editorial}
            />

            {/* Visible Test Cases */}
            <DynamicFieldArray
                control={control}
                register={register}
                name="visibleTestCases"
                title="Visible test cases"
                subtitle="Shown to users on the problem page."
                defaultItem={{
                    input: "",
                    output: "",
                    explanation: "",
                }}
                fields={[
                    {
                        name: "input",
                        label: "Input",
                    },
                    {
                        name: "output",
                        label: "Output",
                    },
                    {
                        name: "explanation",
                        label: "Explanation",
                    },
                ]}
            />

            {/* Hidden Test Cases */}
            <DynamicFieldArray
                control={control}
                register={register}
                name="hiddenTestCases"
                title="Hidden test cases"
                subtitle="Used for submissions; never shown to users."
                defaultItem={{
                    input: "",
                    output: "",
                }}
                fields={[
                    {
                        name: "input",
                        label: "Input",
                    },
                    {
                        name: "output",
                        label: "Output",
                    },
                ]}
            />

            {/* Starter Code */}
            <DynamicFieldArray
                control={control}
                register={register}
                name="startCode"
                title="Starter code"
                subtitle="Code shown to users before they begin."
                defaultItem={{
                    language: "c++",
                    initialCode: "",
                }}
                fields={[
                    {
                        name: "language",
                        label: "Language",
                        type: "select",
                    },
                    {
                        name: "initialCode",
                        label: "Initial code",
                        code: true,
                        fullWidth: true,
                    },
                ]}
            />

            {/* Reference Solution */}
            <DynamicFieldArray
                control={control}
                register={register}
                name="referenceSolution"
                title="Reference solutions"
                subtitle="Complete executable solutions validated by the backend."
                defaultItem={{
                    language: "c++",
                    completeSolution: "",
                }}
                fields={[
                    {
                        name: "language",
                        label: "Language",
                        type: "select",
                    },
                    {
                        name: "completeSolution",
                        label: "Complete solution",
                        code: true,
                        fullWidth: true,
                    },
                ]}
            />
        </form>
    );
}

// ========================================
// HEADER
// ========================================

function FormHeader({ isEdit, saving, onBack }) {
    return (
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
                <button
                    type="button"
                    className="btn btn-ghost btn-sm mb-2"
                    onClick={onBack}
                >
                    ← Back
                </button>

                <h2 className="text-2xl font-black">
                    {isEdit ? "Edit problem" : "Create problem"}
                </h2>

                <p className="text-sm text-base-content/50">
                    {isEdit
                        ? "Update the existing problem safely."
                        : "Add a new problem to the platform."}
                </p>
            </div>

            <button
                className="btn btn-primary"
                disabled={saving}
            >
                {saving ? (
                    <span className="loading loading-spinner loading-sm" />
                ) : isEdit ? (
                    "Save changes"
                ) : (
                    "Create problem"
                )}
            </button>
        </div>
    );
}

// ========================================
// BASIC INFORMATION
// ========================================

function BasicInformation({ register, errors }) {
    return (
        <section className="grid gap-5 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <h3 className="text-lg font-black">
                Basic information
            </h3>

            <FormField
                label="Title"
                error={errors.title}
            >
                <input
                    className="input input-bordered w-full"
                    {...register("title")}
                    placeholder="Two Sum"
                />
            </FormField>

            <FormField
                label="Description"
                error={errors.description}
            >
                <textarea
                    className="textarea textarea-bordered min-h-40 w-full"
                    {...register("description")}
                    placeholder="Describe the problem..."
                />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    label="Difficulty"
                    error={errors.difficulty}
                >
                    <select
                        className="select select-bordered w-full"
                        {...register("difficulty")}
                    >
                        {difficultyOptions.map((item) => (
                            <option
                                key={item.value}
                                value={item.value}
                            >
                                {item.label}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField
                    label="Tag"
                    error={errors.tags}
                >
                    <select
                        className="select select-bordered w-full"
                        {...register("tags")}
                    >
                        {tagOptions.map((item) => (
                            <option
                                key={item.value}
                                value={item.value}
                            >
                                {item.label}
                            </option>
                        ))}
                    </select>
                </FormField>
            </div>
        </section>
    );
}

// ========================================
// EDITORIAL
// ========================================

function Editorial({ register, error }) {
    return (
        <section className="rounded-2xl border border-primary/20 bg-base-100 p-5 shadow-sm">
            <div className="mb-5">
                <h3 className="text-lg font-black">
                    Editorial
                </h3>

                <p className="text-sm text-base-content/50">
                    Official solution explanation shown to users.
                </p>
            </div>

            <FormField
                label="Solution Explanation"
                error={error}
            >
                <textarea
                    className="textarea textarea-bordered min-h-[300px] w-full font-mono text-sm leading-6"
                    {...register("editorial")}
                    placeholder={`Approach:

Explain the main idea.

Algorithm:
1. Step one
2. Step two
3. Step three

Example / Dry Run:
Explain the example.

Time Complexity:
O(n)

Space Complexity:
O(1)`}
                />
            </FormField>
        </section>
    );
}

// ========================================
// FORM FIELD
// ========================================

function FormField({ label, error, children }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-bold">
                {label}
            </label>

            {children}

            {error && (
                <p className="mt-1 text-xs text-error">
                    {error.message}
                </p>
            )}
        </div>
    );
}

export default ProblemForm;