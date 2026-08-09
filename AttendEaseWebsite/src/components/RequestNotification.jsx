import { useEffect, useRef, useState } from "react";
// import { AppStates } from "../services/states";

export async function requestNotification() {
  return new Promise((resolve, reject) => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      reject();
    } else {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          // console.log("Notification permission granted!");
          resolve(true);
        } else if (permission === "denied") {
          // console.log("Permission denied.");
          resolve(false);
        } else {
          // console.log("Permission dismissed.");
          reject(true);
        }
      });
    }
  })
}

export default function RequestNotification() {
  // const { userData, SubscribePushNotification } = AppStates();
  const [permissionStatus, setPermissionStatus] = useState(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const notificationRef = useRef(null);

  useEffect(() => {
    function handleFocus() {
      if ("Notification" in window) {
        const currentPermission = Notification.permission;

        setPermissionStatus(currentPermission);

        if (currentPermission === "denied") {
          setErrorMessage(
            "Notifications are blocked. Please reset permissions in your browser address bar."
          );
        } else {
          setErrorMessage("");
        }

        notificationRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleRequestPermission = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const granted = await requestNotification();

      if (granted) {
        setPermissionStatus("granted");
        const refreshing = await alert("Refreshing...");
        if (refreshing) window.location.reload();
        // await SubscribePushNotification(userData);
      } else {
        setPermissionStatus("denied");
        setErrorMessage("Permission denied. Enable notifications in your browser settings.");
      }
    } catch (err) {
      console.error("Notification Setup Error:", err);
      setErrorMessage("Something went wrong while setting up notifications.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (permissionStatus === "granted") return null;

  return (
    <div
      ref={notificationRef}
      className={`hidden ${permissionStatus === "default" && "!block"} w-full px-5 lg:px-0 max-w-[1370px] mx-auto transition-all duration-300`}
    >
      <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/50 shadow-sm flex flex-col md:flex-row py-4 md:py-6 items-center justify-between gap-4 rounded-xl">

        <div className="flex flex-col gap-1 text-center md:text-left">
          <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            {permissionStatus === "denied" ? "Notifications Blocked" : "Stay in the loop"}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
            {errorMessage || "Enable live institutional announcements and dynamic timetable updates as they happen."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          {permissionStatus === "denied" ? (
            <div className="text-xs px-3 py-1.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-medium text-center border border-amber-100 dark:border-amber-900/30">
              ⚙️ Blocked via Browser Settings
            </div>
          ) : (
            <button
              disabled={isSubmitting}
              onClick={handleRequestPermission}
              className={`w-full md:w-auto px-6 py-2.5 text-sm font-medium border-none rounded-lg text-white shadow-sm transition-all active:scale-[0.98] ${isSubmitting
                ? "bg-indigo-400 dark:bg-indigo-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                }`}
            >
              {isSubmitting ? "Setting up..." : "Allow Notifications"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}