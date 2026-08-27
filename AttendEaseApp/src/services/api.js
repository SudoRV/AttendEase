import AsyncStorage from "@react-native-async-storage/async-storage";

const isProduction = false;
const BASE_URL = isProduction
    ? "https://attendease-nivr.onrender.com"
    : "http://localhost:8000";

export const Fetch = async (endpoint, options = {}) => {
    options.headers = options.headers || {};
    // get the jwt token 
    try {
        const token = await AsyncStorage.getItem("session_token");
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
    } catch (error) {
        console.error("Error pulling session token", error);
    }

    let response = {};
    try {
        response = await fetch(`${BASE_URL}${endpoint}`, options);
    } catch (error) {
        response = {
            status: 503,
            ok: false,
            error
        }
    }

    if (response.status === 401) {
        // perform logout
        await AsyncStorage.clear();
        throw new Error("Unauthorized access token.");
    }

    return response;
}

