const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();


const verifySessionToken = require("./src/middlewares/auth.middleware");

const authRoutes = require("./src/routes/auth.routes");
const timetableRoutes = require("./src/routes/timetable.routes");
const leaveRoutes = require("./src/routes/leave.routes");
const announcementRoutes = require("./src/routes/announcement.routes");

const app = express();
app.use(express.json());
app.use(cors());
app.use(verifySessionToken);




// general routes
app.get("/wake-me-up", (req, res) => {
  res.json({ success: true, message: "i already wokeup" });
})

// download apk
app.get('/download/app', (req, res) => {
  const apkPath = path.join(__dirname, 'static/apk/v2.0.0', 'app-release.apk');

  // res.download forces the browser/phone to download the file instead of trying to open it
  res.download(apkPath, 'AttendEase.apk', (err) => {
    if (err) {
      console.error("Error sending APK file:", err);
      res.status(500).send("Could not download the file.");
    }
  });
});

// get fcm token from client
app.post("/save-fcm-token", async (req, res) => {
  const { user_data, token, topics } = req.body;

  // console.log(user_data)
  const query = `INSERT INTO fcm_tokens (user_id, device_id, fcm_token, device_name, active) 
  VALUES (?, ?, ?, ?, '1') 
  ON DUPLICATE KEY UPDATE 
      fcm_token = VALUES(fcm_token),
      device_name = VALUES(device_name),
      active = '1';`;

  // subscribe to topics
  topics.forEach(async (topic) => {
    await admin.messaging().subscribeToTopic(token, topic);
  })

  try {
    const result = await pool.query(query, [user_data.user_id, "device-1", token, null]);
    // console.log("token saved successfully: ", result)
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err });
  }
})




// auth routes
app.use("/api/auth", authRoutes);

// timetable routes
app.use("/api/timetable", timetableRoutes);

// leave management
app.use("/api/leaves", leaveRoutes);

// announcements
app.use("/api/announcements", announcementRoutes);







// timetable images for morning classes notification
app.use("/api/timetable/classes/image", express.static(path.join(__dirname, 'static/schedule_images'), {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // Tell phones not to cache
  }
}));

// routing all client endpoints to react build files except api calls
app.use(express.static(path.join(__dirname, "build")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// ✅ START SERVER
const PORT = 8000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));




// critical
// Node.js Firebase Admin SDK
// const admin = require("./src/config/fcm");
// const pool = require("./src/config/mysql");

// async function wipeSavedTokens() {
//   // Grab your list of saved FCM tokens from your database
//   const [savedFcmTokens] = await pool.query("select fcm_token from fcm_tokens", []); 

//   for (const token of savedFcmTokens) {
//     try {
//       // This accepts the full tokens perfectly in chunks of up to 1,000
//       const topicToClear = "CSE_4_A"
//       const response = await admin.messaging().unsubscribeFromTopic(token.fcm_token, topicToClear);
//       console.log(`Successfully removed ${response.successCount} devices from ${topicToClear}`);
//     } catch (error) {
//       console.error('Failed to unsubscribe tokens from topic:', error);
//     }
//   }
// }

// // wipeSavedTokens();