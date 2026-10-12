// hum zod ka use krege validation lgane k liya data ke upr ko
// zod ko use krne k liya hume hookform resolver bhi install krna hoga

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../authSlice";


const signupSchema = z.object({
    firstName: z.string().min(3, "Name should contain at least 3 character"),

    emailId: z.string().email("Enter a valid email"),

    password: z
        .string()
        .min(8, "Password must contain at least 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
            "Enter a strong password: uppercase, lowercase, number and special character"
        )
});


function Signup() {

    // Redux dispatch function
    const dispatch = useDispatch();

    // Used for changing pages
    const navigate = useNavigate();

    // Get authentication state from Redux
    const { isAuthenticated, loading, error } = useSelector(
        (state) => state.auth
    );

    // If user is already logged in, go to homepage
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, navigate]);


    const {
        register,
        handleSubmit,

        // isSubmitting prevents multiple form submissions
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(signupSchema)
    });


    // Runs when form validation is successful
    const onSubmit = async (data) => {

        try {

            console.log("Signup data:", data);

            const result = await dispatch(registerUser(data));

            // Check whether registration was successful
            if (registerUser.fulfilled.match(result)) {
                navigate("/", { replace: true });
            }

        } catch (error) {
            console.log("Registration failed:", error);
        }
    };


    // Go to Login page
    const goToLogin = () => {
        navigate("/login");
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="card w-full max-w-md bg-base-100 shadow-2xl overflow-hidden"
            >

                <div className="card-body">

                    <h2 className="card-title text-3xl justify-center mb-6">
                        Create Account
                    </h2>


                    {/* First Name */}
                    <div className="form-control w-full">

                        <label className="label mb-1">
                            <span className="label-text">
                                First Name
                            </span>
                        </label>

                        <input
                            type="text"
                            placeholder="Enter your name"
                            className={`input input-bordered w-full ${
                                errors.firstName ? "input-error" : ""
                            }`}
                            {...register("firstName")}
                        />

                        {errors.firstName && (
                            <label className="label">
                                <span className="label-text-alt text-error">
                                    {errors.firstName.message}
                                </span>
                            </label>
                        )}

                    </div>


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
                            <div className="mt-2 w-full px-1">
                                <span className="block w-full max-w-full text-sm leading-5 text-error whitespace-normal break-words">
                                    {errors.password.message}
                                </span>
                            </div>
                        )}

                    </div>


                    {/* API Error */}
                    {error && (
                        <div className="alert alert-error mt-3">
                            <span>{error}</span>
                        </div>
                    )}


                    {/* Submit Button */}
                    <div className="card-actions mt-6">

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={isSubmitting || loading}
                        >
                            {isSubmitting || loading
                                ? "Creating Account..."
                                : "Create Account"}
                        </button>

                    </div>


                    {/* Already Registered */}
                    <div className="text-center mt-4">

                        <span className="text-sm">
                            Already registered?
                        </span>

                        <button
                            type="button"
                            onClick={goToLogin}
                            className="ml-1 text-primary font-semibold hover:underline"
                        >
                            Login
                        </button>

                    </div>

                </div>

            </form>

        </div>
    );
}

export default Signup;