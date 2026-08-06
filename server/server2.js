const express = require("express");
const cors = require("cors");
const path = require("path");
const admin = require("./src/config/fcm");
const cookieParser = require("cookie-parser");
require("dotenv").config();




const verifySessionToken = require("./src/middlewares/auth.middleware");

const authRoutes = require("./src/routes/auth.routes");
const timetableRoutes = require("./src/routes/timetable.routes");
const leaveRoutes = require("./src/routes/leave.routes");
const announcementRoutes = require("./src/routes/announcement.routes");
const attendanceRouter = require("./src/routes/attendance.routes");

const morningTimetableReminder = require("./src/crons/reminder.timetable.morning");
const nightTimetableReminder = require("./src/crons/reminder.timetable.night")




const app = express();
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://10.30.212.249:8000'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));








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
app.post("/save-fcm-token", verifySessionToken, async (req, res) => {
  const { token, topics } = req.body;
  const userData = req.user;

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
    const result = await pool.query(query, [userData.user_id, "device-1", token, null]);
    console.log("token saved successfully: ", result)
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err });
  }
})




// auth routes
app.use("/api/auth", authRoutes);

// timetable routes
app.use("/api/timetable", verifySessionToken, timetableRoutes);

// leave management
app.use("/api/leaves", verifySessionToken, leaveRoutes);

// announcements
app.use("/api/announcements", verifySessionToken, announcementRoutes);

// attendance
app.use("/api/attendance", verifySessionToken, attendanceRouter);




// reminders for night and morning timetable
nightTimetableReminder();
morningTimetableReminder();


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