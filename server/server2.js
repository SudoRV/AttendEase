const express = require("express");
const cors = require("cors");
const path = require("path");
const admin = require("./src/config/fcm");
const pool = require("./src/config/mysql");
const cookieParser = require("cookie-parser");
require("dotenv").config();



const verifySessionToken = require("./src/middlewares/auth.middleware");

const authRoutes = require("./src/routes/auth.routes");
const timetableRoutes = require("./src/routes/timetable.routes");
const leaveRoutes = require("./src/routes/leave.routes");
const announcementRoutes = require("./src/routes/announcement.routes");
const attendanceRouter = require("./src/routes/attendance.routes");

const { buildFcmTopicsFromSchedule, buildFcmTopicsByTarget, buildFcmTopicsByTarget2 } = require("./src/utils/buildFcmTopics");
const { morningTimetableReminder } = require("./src/crons/reminder.timetable.morning");
const { notifyTimetable, nightTimetableReminder } = require("./src/crons/reminder.timetable.night")




const app = express();
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  
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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'QUERY', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
  const { token } = req.body;
  const user = req.user;

  const topics = await buildFcmTopicsByTarget2(user.college_id, [user.course_id], [user.branch_id], [user.year], [user.section], user.role === "Student" ? "students" : "teachers");

  const query = `INSERT INTO fcm_tokens (user_id, device_name, device_id, fcm_token) 
  VALUES (?, ?, ?, ?) 
  ON DUPLICATE KEY UPDATE 
      fcm_token = VALUES(fcm_token),
      device_name = VALUES(device_name)`;

  try {
    const result = await pool.query(query, [user.id, "device-1", null, token]);

    // subscribe to topics
    topics.forEach(async (topic) => {
      await admin.messaging().subscribeToTopic(token, topic);
    });

    res.json({ success: true });
  } catch (err) {
    console.warn(err)
    res.json({ success: false, error: err });
  }
})

// potentially new route
app.get("/college/metadata/all", verifySessionToken, async (req, res) => {
  const user = req.user;

  const [ rows ] = await pool.query("select group_concat(distinct course_id order by course_id) as course, group_concat(distinct branch_id order by branch_id) as branch, group_concat(distinct year order by year) as year, group_concat(distinct section order by section) as section, group_concat(distinct day order by day) as day from schedule where college_id = ?", [user.college_id]);

  if(rows.length > 0) res.json({success: true, message: "successfully fetched college metadata!", data: rows[0]});
  else res.json({success: false, message: `failed to fetch metadata of college id: ${user.college_id}`});
})

app.query("/college/metadata", verifySessionToken, async (req, res) => {
  const { query } = req.query;
  const { college_id: collegeId, course_id: courseId, branch_id: branchId, year } = req.body;

  // console.log(req.query, collegeId, courseId, branchId, year)

  if (query === "colleges") {
    const [colleges] = await pool.query("select id, college_id, college_name, university from colleges order by college_name");
    // console.log(colleges);

    if (colleges.length > 0) return res.status(200).json({success: true, colleges, message: "Successfully fetched colleges."});
    else res.status(200).json({success: false, colleges: [], message: "No college found!"});
  } 

  else if (query === "courses") {
    const [courses] = await pool.query("select distinct c.id, c.course_name, c.course_id, c.total_semesters from courses c inner join schedule s on s.college_id = c.college_id where s.college_id in (?) order by course_id", [collegeId]);
    // console.log(courses);

    if (courses.length > 0) return res.status(200).json({success: true, courses, message: "Successfully fetched courses."});
    else res.status(200).json({success: false, courses: [], message: "No course found for the selected college!"});
  }

  else if (query === "branches") {
    const [branches] = await pool.query("select distinct b.id, b.branch_name, b.branch_id from schedule s inner join branches b on s.branch_id = b.branch_id where s.college_id in (?) and s.course_id in (?) order by branch_id", [collegeId, courseId]);
    // console.log(branches);

    if (branches.length > 0) return res.status(200).json({success: true, branches, message: "Successfully fetched branches."});
    else res.status(200).json({success: false, branches: [], message: "No branch found for the selected college and course!"});
  }

  else if (query === "years") {
    const [years] = await pool.query("select distinct year from schedule where college_id in (?) and course_id in (?) and branch_id in (?) order by year", [collegeId, courseId, branchId]);
    // console.log(years);

    if (years.length > 0) return res.status(200).json({success: true, years, message: "Successfully fetched years."});
    else res.status(200).json({success: false, years: [], message: "No year found for the selected college, course and branch!"});
  }

  else if (query === "sections") {
    const [sections] = await pool.query("select distinct section from schedule where college_id in (?) and course_id in (?) and branch_id in (?) and year in (?) order by section", [collegeId, courseId, branchId, year]);
    // console.log(sections);

    if (sections.length > 0) return res.status(200).json({success: true, sections, message: "Successfully fetched sections."});
    else res.status(200).json({success: false, sections: [], message: "No section found for the selected college, course, branch and year!"});
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
app.use("/timetable/classes/image", express.static(path.join(__dirname, '/src/static/schedule_images'), {
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
