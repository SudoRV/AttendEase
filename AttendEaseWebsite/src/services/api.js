const isProduction = false;
const BASE_URL = isProduction
    ? "https://attendease-nivr.onrender.com"
    : "http://localhost:8000";

export const buildUrl = (endpoint) => `${BASE_URL}${endpoint}`;

export const Fetch = async (endpoint, options = {}) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        credentials: "include",
    });

    if (response.status === 401) {
        if(window.location.pathname !== "/dashboard") return response;
        // perform logout
        window.localStorage.removeItem("user_creds");
        setTimeout(() => {
            window.location.href = "/login";
        }, 2600);
    }

    return response;
}

