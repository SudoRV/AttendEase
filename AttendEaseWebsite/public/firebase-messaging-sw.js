importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");


const firebaseConfig = {
    apiKey: "AIzaSyAvfH_ZkssBugFWpqTQVMNEFjWPmieIHfw",
    authDomain: "scheduler-56a76.firebaseapp.com",
    projectId: "scheduler-56a76",
    messagingSenderId: "959032391778",
    appId: "1:959032391778:web:caa9762a8f0a737a95793b",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log("Background Message received: ", payload);

    const notificationTitle = payload.data?.title || "New Update";

    const notificationOptions = {
        body: payload.data?.body || "Open AttendEase for details",
        icon: "./AttendEase_icon.png",
        data: payload.data,
        tag: "alerts", // Prevents notification stacking
        badge: "./AttendEase_badge.png",
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});