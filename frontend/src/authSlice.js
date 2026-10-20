import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "./utils/axiosClient";

const getErrorMessage = (error, fallback) => {
    const data = error?.response?.data;

    if (data && typeof data === "object" && data.message) {
        return data.message;
    }

    if (
        typeof data === "string" &&
        data.trim() &&
        !/^\s*</.test(data)
    ) {
        return data;
    }

    return error?.message || fallback;
};

// The check endpoint must return a valid user object.
const validateAuthResponse = (data) => {
    if (
        !data ||
        typeof data !== "object" ||
        !data.user ||
        typeof data.user !== "object" ||
        !data.user._id
    ) {
        throw new Error(
            "Invalid authentication response. Check the API proxy and /user/check endpoint."
        );
    }

    return data;
};

const getCheckedUser = async () => {
    const response = await axiosClient.get("/user/check");
    return validateAuthResponse(response.data);
};

export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async (data, { rejectWithValue }) => {
        try {
            await axiosClient.post("/user/register", data);
            return await getCheckedUser();
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Registration failed")
            );
        }
    }
);

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (data, { rejectWithValue }) => {
        try {
            await axiosClient.post("/user/login", data);
            return await getCheckedUser();
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Login failed")
            );
        }
    }
);

export const checkAuth = createAsyncThunk(
    "auth/checkAuth",
    async (_, { rejectWithValue }) => {
        try {
            return await getCheckedUser();
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Authentication check failed")
            );
        }
    }
);

export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async (_, { rejectWithValue }) => {
        try {
            return (await axiosClient.post("/user/logout")).data;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Logout failed")
            );
        }
    }
);

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.user = null;
                state.isAuthenticated = false;
            })

            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
            })

            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                Object.assign(state, initialState);
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default authSlice.reducer;