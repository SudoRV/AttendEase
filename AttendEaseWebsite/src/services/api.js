const isProduction = false;
const BASE_URL = isProduction
    ? "https://attendease-nivr.onrender.com"
    : "http://localhost:8000";

export const Fetch = async (endpoint, options = {}) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        credentials: "include",
    });

    if (response.status === 401) {
        // perform logout
        window.localStorage.removeItem("user_creds");
        window.location.reload();
        window.location.href = "/login";
        throw new Error("Unauthorized access token.");
    }

    return response;
}

