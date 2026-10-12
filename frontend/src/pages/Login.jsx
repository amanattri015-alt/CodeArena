import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../authSlice";

const loginSchema = z.object({
    emailId: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password contain at least 8 character")
});

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        isAuthenticated,
        loading,
        error
    } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data) => {
        const result = await dispatch(loginUser(data));

        if (loginUser.fulfilled.match(result)) {
            navigate("/", { replace: true });
        }
    };

    // Go to Signup page
    const goToSignup = () => {
        navigate("/signup");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="card w-full max-w-md bg-base-100 shadow-2xl"
            >

                <div className="card-body">

                    <h2 className="card-title text-3xl justify-center mb-6">
                        Login
                    </h2>

                    {/* API Error */}
                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Email */}
                    <div className="form-control w-full">

                        <label className="label mb-1">
                            <span className="label-text">
                                Email
                            </span>
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            className={`input input-bordered w-full ${
                                errors.emailId ? "input-error" : ""
                            }`}
                            {...register("emailId")}
                        />

                        {errors.emailId && (
                            <label className="label">
                                <span className="label-text-alt text-error">
                                    {errors.emailId.message}
                                </span>
                            </label>
                        )}

                    </div>

                    {/* Password */}
                    <div className="form-control w-full">

                        <label className="label mb-1">
                            <span className="label-text">
                                Password
                            </span>
                        </label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            className={`input input-bordered w-full ${
                                errors.password ? "input-error" : ""
                            }`}
                            {...register("password")}
                        />

                        {errors.password && (
                            <label className="label">
                                <span className="label-text-alt text-error">
                                    {errors.password.message}
                                </span>
                            </label>
                        )}

                    </div>

                    {/* Submit */}
                    <div className="card-actions mt-6">

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                    </div>

                    {/* Signup Link */}
                    <div className="text-center mt-4">
                        <span className="text-sm">
                            Don't have an account?
                        </span>

                        <button
                            type="button"
                            onClick={goToSignup}
                            className="ml-1 text-primary font-semibold hover:underline"
                        >
                            Sign Up
                        </button>
                    </div>

                </div>
            </form>

        </div>
    );
}

export default Login;