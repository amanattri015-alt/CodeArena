import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import axiosClient from "../utils/axiosClient";
import AIChat from "../components/AIChat/AIChat";
import ProblemHeader from "../components/ProblemHeader";
import ProblemTabs from "../components/ProblemTabs";
import ProblemConsole from "../components/ProblemConsole";
import ProblemEditor from "../components/ProblemEditor";

import ProblemContent from "../components/ProblemPage/ProblemContent";
import Editorial from "../components/ProblemPage/Editorial";
import SubmissionHistory from "../components/ProblemPage/SubmissionHistory";

function ProblemPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // =========================================================
    // STATE
    // =========================================================

    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);

    const [language, setLanguage] = useState("c++");
    const [code, setCode] = useState("");

    const [running, setRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const [activeTab, setActiveTab] = useState("problem");

    // Controls the output window
    const [showConsole, setShowConsole] = useState(false);

    // =========================================================
    // FETCH PROBLEM + SAVED SOLUTION
    // =========================================================

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoading(true);
                setError("");

                // -------------------------------------------------
                // Get problem
                // -------------------------------------------------

                const response = await axiosClient.get(
                    `/problem/problemById/${id}`
                );

                const problemData =
                    response.data?.problem;

                if (!problemData) {
                    throw new Error(
                        "Problem not found"
                    );
                }

                setProblem(problemData);

                // -------------------------------------------------
                // Set default language and starter code
                // -------------------------------------------------

                const defaultLanguage =
                    problemData.startCode?.find(
                        (item) =>
                            item.language === "c++"
                    ) ||
                    problemData.startCode?.[0];

                if (defaultLanguage) {
                    setLanguage(
                        defaultLanguage.language
                    );

                    setCode(
                        defaultLanguage.initialCode ||
                            ""
                    );
                }

                // -------------------------------------------------
                // Try to load user's accepted solution
                // -------------------------------------------------

                try {
                    const solutionResponse =
                        await axiosClient.get(
                            `/problem/acceptedSolution/${id}`
                        );

                    const savedSolution =
                        solutionResponse.data
                            ?.solution;

                    if (savedSolution?.code) {
                        setLanguage(
                            savedSolution.language
                        );

                        setCode(
                            savedSolution.code
                        );
                    }
                } catch (solutionError) {
                    /*
                     * 404 means the user has not solved
                     * this problem yet.
                     *
                     * In that case we keep the starter code.
                     */

                    if (
                        solutionError.response
                            ?.status !== 404
                    ) {
                        console.error(
                            "Unable to load saved solution:",
                            solutionError
                        );
                    }
                }
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        err.message ||
                        "Unable to load problem"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, [id]);

    // =========================================================
    // LANGUAGE CHANGE
    // =========================================================

    const handleLanguageChange = (
        newLanguage
    ) => {
        setLanguage(newLanguage);

        const starterCode =
            problem?.startCode?.find(
                (item) =>
                    item.language === newLanguage
            );

        setCode(
            starterCode?.initialCode || ""
        );

        // Clear previous result
        setResult(null);
        setError("");
    };

    // =========================================================
    // RESET CODE
    // =========================================================

    const handleReset = () => {
        const starterCode =
            problem?.startCode?.find(
                (item) =>
                    item.language === language
            );

        setCode(
            starterCode?.initialCode || ""
        );

        setResult(null);
        setError("");
    };

    // =========================================================
    // RUN CODE
    // =========================================================

    const handleRun = async () => {
        try {
            setRunning(true);

            setResult(null);
            setError("");

            const response =
                await axiosClient.post(
                    `/problem/run/${id}`,
                    {
                        code,
                        language,
                    }
                );

            setResult({
                type: "run",
                data: response.data,
            });

            // Open output window
            setShowConsole(true);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Code execution failed"
            );

            // Show error in output window
            setShowConsole(true);
        } finally {
            setRunning(false);
        }
    };

    // =========================================================
    // SUBMIT CODE
    // =========================================================

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            setResult(null);
            setError("");

            const response =
                await axiosClient.post(
                    `/problem/submit/${id}`,
                    {
                        code,
                        language,
                    }
                );

            setResult({
                type: "submit",
                data: response.data,
            });

            // Open output window
            setShowConsole(true);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Submission failed"
            );

            // Show error in output window
            setShowConsole(true);
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-base-200">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    // =========================================================
    // PROBLEM NOT FOUND
    // =========================================================

    if (!problem) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-base-200 p-6">

                <div className="w-full max-w-md rounded-xl border border-error/30 bg-base-100 p-8 text-center">

                    <h2 className="text-xl font-bold text-error">
                        Problem not found
                    </h2>

                    <p className="mt-2 text-base-content/60">
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            navigate("/")
                        }
                        className="btn btn-primary mt-5"
                    >
                        Back to Problems
                    </button>

                </div>

            </div>
        );
    }

    // =========================================================
    // MAIN UI
    // =========================================================

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-base-200">

            {/* ================================================= */}
            {/* HEADER                                            */}
            {/* ================================================= */}

            <ProblemHeader
                problem={problem}
            />

            {/* ================================================= */}
            {/* TABS                                              */}
            {/* ================================================= */}

            <ProblemTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            {/* ================================================= */}
            {/* MAIN WORKSPACE                                    */}
            {/* ================================================= */}

            <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">

                {/* ================================================= */}
                {/* LEFT PANEL                                         */}
                {/* ================================================= */}

                <div className="min-h-0 overflow-hidden border-r border-base-300 bg-base-100">

                    {/* --------------------------------------------- */}
                    {/* OUTPUT WINDOW                                  */}
                    {/* --------------------------------------------- */}

                    {showConsole ? (
                        <ProblemConsole
                            result={result}
                            error={error}
                            onClose={() =>
                                setShowConsole(false)
                            }
                        />
                    ) : (

                        /* ----------------------------------------- */
                        /* TAB CONTENT                                */
                        /* ----------------------------------------- */

                        <div className="h-full">

                            {/* =============================== */}
                            {/* PROBLEM                          */}
                            {/* =============================== */}

                            {activeTab === "problem" && (
                                <ProblemContent
                                    problem={problem}
                                />
                            )}

                            {/* =============================== */}
                            {/* EDITORIAL                        */}
                            {/* =============================== */}

                            {activeTab === "editorial" && (
                                <Editorial
                                    problem={problem}
                                />
                            )}

                            {/* =============================== */}
                            {/* SUBMISSIONS                      */}
                            {/* =============================== */}

                            {activeTab ===
                                "submissions" && (
                                <SubmissionHistory
                                    problemId={id}
                                />
                            )}

                        </div>
                    )}

                </div>

                {/* ================================================= */}
                {/* RIGHT PANEL - CODE EDITOR                         */}
                {/* ================================================= */}

                <ProblemEditor
                    problem={problem}
                    language={language}
                    code={code}
                    setCode={setCode}
                    onLanguageChange={
                        handleLanguageChange
                    }
                    onReset={handleReset}
                    onRun={handleRun}
                    onSubmit={handleSubmit}
                    running={running}
                    submitting={submitting}
                />

                <AIChat
                   problem={problem}
                   code={code}
                   language={language}
                 />

            </div>

        </div>
    );
}

export default ProblemPage;