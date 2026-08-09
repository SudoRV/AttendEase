import { Fetch } from "../services/api";

export default async function logout(setLoading) {
    if (setLoading) setLoading(true);
    // ask for logout 
    const res = await Fetch("/api/auth/logout", {
        method: "POST"
    });
    const response = await res.json();
    const loggedOut = response.success;

    if(loggedOut) {
        window.localStorage.removeItem("user_creds");
        await new Promise(resolve => setTimeout(resolve, 1200));
        alert(response.message)
        if (setLoading) setLoading(false);
        window.location.href = "/login";
    };
}