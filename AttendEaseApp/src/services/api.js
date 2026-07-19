import AsyncStorage from "@react-native-async-storage/async-storage";

const isProduction = false;
const BASE_URL = isProduction
    ? "https://attendease-nivr.onrender.com"
    : "http://10.30.212.249:8000";

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


    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    if (response.status === 401) {
        // perform logout
        await AsyncStorage.removeItem("session_token");
        throw new Error("Unauthorized access token.");
    }

    return response;
}

