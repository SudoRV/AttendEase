import { Fetch } from "../services/api";

export default async function logout(setLoading) {
    if (setLoading) setLoading(true);
    const token = await window.localStorage.getItem("fcm_token");

    // ask for logout 
    const res = await Fetch("/api/auth/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({token: token})
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