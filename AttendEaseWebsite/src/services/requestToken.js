import { messaging } from "./firebase";
import { getToken } from "firebase/messaging";

export async function requestFCMToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const token = await getToken(messaging, {
      vapidKey: "BEoaY1sCmF2Ma2WpV9VJsNfb4sude2ASe2ZOk5lgm2SR6YpJeDFoo28wFBwzuEwKQuc8i9AmHz0LB6wtAsP5xhg",
    });

    // console.log("FCM Token:", token);
    return token;
  } catch (err) {
    console.error(err);
  }
}


// 2Toc2esq2YnHB7kcGQRb-BmpqFBGbblVBKNzBwvm8nE

// BEoaY1sCmF2Ma2WpV9VJsNfb4sude2ASe2ZOk5lgm2SR6YpJeDFoo28wFBwzuEwKQuc8i9AmHz0LB6wtAsP5xhg