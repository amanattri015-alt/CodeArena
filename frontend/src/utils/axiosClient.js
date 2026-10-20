import axios from "axios";

// Local development uses localhost.
// Production uses the Vercel API proxy.
const baseURL = import.meta.env.PROD
    ? "/api"
    : (import.meta.env.VITE_API_URL || "http://localhost:3000");

const axiosClient = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Detect when Vercel returns index.html instead of an API response.
axiosClient.interceptors.response.use(
    (response) => {
        const data = response.data;

        const isHtmlResponse =
            typeof data === "string" &&
            /^\s*(<!doctype\s+html|<html[\s>])/i.test(data);

        if (isHtmlResponse) {
            return Promise.reject(
                new Error(
                    "API proxy error: Vercel returned index.html instead of an API response. Check the Vercel Root Directory and vercel.json."
                )
            );
        }

        return response;
    },
    (error) => Promise.reject(error)
);

export default axiosClient;