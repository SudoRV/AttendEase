const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcrypt");
const admin = require("./firebaseAdmin");
const cron = require("node-cron");
const path = require("path");
const { error } = require("console");
const axios = require("axios");
require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require('crypto');

const parseAttendanceTable = require("./utility/parseAttendanceTable");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Create MySQL connection pool
const config = {
  user: "uvjrd469tio0mrjz",
  host: "bw29rwejnmb7a0ihv8ip-mysql.services.clever-cloud.com",
  password: "A6q9yQI2tphgxS9bxWN0",
  database: "bw29rwejnmb7a0ihv8ip",
  waitForConnections: true,
}

const config2 = {
  user: "root",
  host: "localhost",
  password: "rahul@1992#",
  database: "scheduler",
  waitForConnections: true,
}

const pool = mysql.createPool(config);

// console.log(process.env.EMAIL, process.env.PASS)
// Create a transporter with your email service credentials
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465, 
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

app.get("/wake-me-up", (req, res) => {
  res.json({ success: true, message: "i already wokeup" });
})

// get fcm token from client
app.post("/save-fcm-token", async (req, res) => {
  const { email, token, topics } = req.body;
  const query = "update users set fcm_token = ? where email = ?";

  // subscribe to topics
  topics.forEach(async (topic) => {
    // console.log(topic)
    await admin.messaging().subscribeToTopic(token, topic);
  })

  try {
    const response = await pool.query(query, [token, email]);
    // console.log("saved successfully")
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err });
  }
})



// ✅ Endpoint: Validate credentials
const validateCreds = async (data) => {
  if (!data || Object.keys(data).length === 0) {
    return { success: false, message: "no fields provided" };
  }

  const fields = Object.keys(data);
  const values = Object.values(data);
  const whereClause = fields.map(f => `${f} = ?`).join(" AND ");

  const [rows] = await pool.query(
    `SELECT * FROM users WHERE ${whereClause} LIMIT 1`,
    values
  );

  if (rows.length > 0) {
    return { success: true, message: "credentials found" };
  }

  return { success: false, message: "credentials not found" };
};

app.post("/validate-creds", async (req, res) => {
  try {
    const result = await validateCreds(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});


app.post("/reset-password", async (req, res) => {
  const { email, old_password, new_password, otp: userOtp, type } = req.body;

  const [user] = await pool.query("select * from users where email = ?", [email]);
  // console.log(user);

  if (user?.length === 0) {
    return res.status(400).json({ success: false, message: "user doesn't exists" });
  }

  if (type === "change") {
    const isMatch = await bcrypt.compare(old_password, user[0].password_hash);

    if (!isMatch) return res.json({ success: false, message: "password not matched" });

    const new_password_hash = await bcrypt.hash(new_password, 10);

    // update the databse
    const response = await pool.query("update users set password_hash = ? where email = ?", [new_password_hash, email]);

    if (response.affectedRows > 0) return res.json({ success: true, message: "password changed successfully" });

    res.json({ success: false, message: "Internal server error" });
  } 
  
  else if (type === "request_otp") {
    const verifiedEmail = user[0].email;
    // generate top
    const otp = {
      code: generateOTP(),
      request_time: Date.now(),
      ttl: 15,
    };
    // save otp data to database
    const response = pool.query("update users set otp = ? where email = ?", [JSON.stringify(otp), verifiedEmail]);
    
    if(response.affectedRows <= 0) {
      return res.json({success: false, message: "Internal server error"});
    }

    // send otp to user via gmail smtp
    const mailOptions = {
      from: '"AttendEase Support" <help.sudorv@gmail.com>',
      to: verifiedEmail,
      subject: `${otp.code} is your AttendEase reset code`,
      html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 0; width: 100%;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">AttendEase</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 20px 40px 20px; text-align: center;">
              <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 16px;">Reset Your Password</h2>
              <p style="color: #64748b; font-size: 16px; line-height: 24px; margin-bottom: 32px;">
                We received a request to reset your password. Use the code below to proceed. This code will expire in 10 minutes.
              </p>
              
              <div style="background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: bold; color: #4f46e5; letter-spacing: 8px;">
                  ${otp.code}
                </span>
              </div>

              <p style="font-size: 16px;">This OTP is valid only for ${otp.ttl} min.</p>
              
              <p style="color: #94a3b8; font-size: 14px; line-height: 20px;">
                If you didn't request this, you can safely ignore this email. Your password won't change until you use this code to create a new one.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 30px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                &copy; 2026 AttendEase. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </div>
    `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to send email" });
      }
      res.json({ success: true, message: "OTP sent successfully, Check your email." });
    });

  } else if (type === "verify_reset") {
    const otp = user[0].otp;
  
    if(!otp.code || new Date(otp.request_time).getTime() + otp.ttl * 60 * 1000 < new Date().getTime() || otp.code !== userOtp) {
      return res.status(400).json({success: false, message: "OTP incorrect or expired"});
    }

    // reset password
    const new_password_hash = await bcrypt.hash(new_password, 10);

    // update the databse
    const response = await pool.query("update users set password_hash = ? where email = ?", [new_password_hash, email]);

    if (response.affectedRows > 0) return res.json({ success: true, message: "password reset successfully" });

    res.json({ success: false, message: "Internal server error" });
  }
})

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // basic validation
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password required" });
  }

  // authentication from database / get password hash from databse
  const [user] = await pool.query(`select * from users where email = ?`, email);

  if (!user[0].email) {
    res.json({ success: false, message: "user not found" });
    return;
  }

  // compare the password hash
  const isMatch = await bcrypt.compare(password, user[0].password_hash);

  if (isMatch) {
    delete user[0].password_hash;
    res.json({ success: true, message: "user authenticated and authorised", user_creds: user[0] });
  } else {
    res.json({ success: false, message: "Incorrect password", });
  }
})

app.post("/register", async (req, res) => {
  const { role, name, email, password, student_id, teacher_id, branch, year } = req.body;

  if (!email || !password) {
    res.json({ success: false, message: "Credentials required" })
  }

  const response = await validateCreds({
    email,
    [student_id === "" ? "teacher_id" : "student_id"]: student_id === "" ? teacher_id : student_id
  })

  // console.log(response)

  if (response.success == false) {
    // convert password to password hash
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    req.body.password = password_hash;

    pool.query(
      `INSERT INTO users (role, name, email, password_hash, student_id, teacher_id, branch, year)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      Object.values(req.body).map(v => v === "" ? "NULL" : v),
      (err, result) => {
        if (err) {
          console.error("Error inserting user:", err);
        } else {
          console.log("User inserted successfully:", result.insertId);
        }
      }
    );

    res.json({ success: true, message: "Registered Successfully" });
  } else {
    res.json({ success: false, message: "Already Registered" })
  }
})


// fetch timetable
app.get("/get-timetable", async (req, res) => {
  try {
    const { year, branch, section = "A", day, teacher_id, teacher_name } = req.query;

    // check if cancelled periods are expired or not
    const cancel_cancelled_class_query = `UPDATE schedule
      SET cancelled = 0,
          cancelled_from = NULL,
          cancelled_to = NULL,
          substitute_teacher_id = NULL,
          substitute_teacher_name = NULL
      WHERE CURDATE() > DATE(cancelled_to);
    `;

    try {
      const response1 = await pool.query(cancel_cancelled_class_query);
      if (response1.affectedRows > 0) {
        console.log("removing expired leaves classes", response1);
      }
    } catch (error) {
      throw error;
    }

    if (teacher_id && teacher_id !== "undefined") {
      if (day === "" || day === undefined) {
        const query = `select id, day, period_id, subject_id, subject_name, teacher_name, teacher_id, cancelled from schedule where teacher_id = ? order by period_id`;
        const [rows] = await pool.query(query, [
          year, branch, section,
        ]);

        let timetable = {};
        rows.forEach(row => {
          if (!timetable[row.day]) {
            timetable[row.day] = [];
          }
          timetable[row.day].push({
            period_id: row.period_id,
            subject_id: row.subject_id,
            subject_name: row.subject_name,
            teacher_name: row.teacher_name
          });
        });

        res.json({
          success: true,
          data: timetable
        });
      } else {
        const query = `select id, day, period_id, subject_id, subject_name, teacher_name, teacher_id, year, branch_id, branch_name, section, room_number, cancelled from schedule where teacher_id = ? and day = ? order by period_id`;
        const [classes] = await pool.query(query, [teacher_id, day
        ]);

        res.json({
          success: true,
          data: { day: day, classes: classes }
        })

      }


    } else {
      if (day === "" || day === undefined) {
        const query = `select day, period_id, subject_id, subject_name, teacher_name, teacher_id, cancelled from schedule where year = ? and branch_id = ? and section = ? order by day, period_id`;
        const [rows] = await pool.query(query, [
          year, branch, section,
        ]);

        let timetable = {};
        rows.forEach(row => {
          if (!timetable[row.day]) {
            timetable[row.day] = [];
          }
          timetable[row.day].push({
            period_id: row.period_id,
            subject_id: row.subject_id,
            subject_name: row.subject_name,
            teacher_name: row.teacher_name
          });
        });

        res.json({
          success: true,
          data: timetable
        });

      } else {
        const query = `select day, period_id, subject_id, subject_name, teacher_name, teacher_id, cancelled from schedule where year = ? and branch_id = ? and section = ? and day = ? order by period_id`;
        const [classes] = await pool.query(query, [
          year, branch, section, day
        ]);

        res.json({
          success: true,
          message: "thrown classes",
          data: { day: day, classes: classes }
        })
      }
    }
  } catch (err) {
    res.json({
      success: false,
      message: "Internal server error"
    })
    console.log(err);
  }
})

// add / update schedule
app.post("/update-schedule", async (req, res) => {
  const { action, subject_data } = req.body;

  let query = "";
  let values = Object.values(subject_data?.changes);

  if (action === "Update") {
    query = `update schedule set ${Object.keys(subject_data?.changes).map(key => `${key} = ? where id = ?`).join(", ")}`;
    values.push(subject_data.id);
  } else if (action === "Insert") {
    query = `insert into schedule (${Object.keys(subject_data?.changes).map(key => `${key}`).join(", ")}) values (${Object.keys(subject_data?.changes).map(key => "?").join(", ")})`;
  } else {
    query = "delete from schedule where id = ?";
    values = [subject_data.id];
  }


  try {
    const [result] = await pool.query(query, values);
    if (result.affectedRows > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Internal server error" });
  }
})


// fetch leave
app.get("/fetch-leaves", async (req, res) => {
  const { user_data } = req.query;
  const userData = JSON.parse((user_data));

  let query = "";
  let query2 = "";
  let values = [];
  let values2 = []

  if (userData?.role === "Student") {
    query = "select name, year, branch, student_id, subject, application, applicable_from, applicable_to, status, created_at from leaves where student_id = ? and month(created_at) = month(current_date()) and year(created_at) = year(current_date()) order by created_at desc";
    values = [userData?.student_id];

    query2 = `
      SELECT DISTINCT l.teacher_id, l.name, l.applicable_from, l.applicable_to, l.status
      FROM leaves l
      JOIN schedule s ON l.teacher_id = s.teacher_id
      WHERE s.year = ? 
      AND s.branch_id = ? 
      AND s.section = ?
      AND applicable_to > CURRENT_TIMESTAMP
      `;
    values2 = [userData.year, userData.branch, userData.section || "A"];

  } else {
    query = `SELECT
      l.name,
      l.year,
      l.branch,
      l.student_id,
      l.subject,
      l.application,
      l.applicable_from,
      l.applicable_to,
      l.status,
      l.created_at,
      COUNT(*) OVER (PARTITION BY l.student_id) AS total_leaves
    FROM leaves l
    WHERE
      l.applicable_to > CURRENT_DATE
      AND EXISTS (
        SELECT 1
        FROM schedule s
        WHERE s.teacher_id = ?
          AND s.year = l.year
          AND s.branch_id = l.branch
          AND s.section = l.section
          AND FIND_IN_SET(s.day, l.affected_days)
      )
    ORDER BY l.created_at DESC;
    `;
    values = [userData?.teacher_id]

    // teacher leaves
    query2 = `select teacher_id, name, applicable_from, applicable_to, status from leaves where teacher_id != 'not a teacher' and applicable_to > current_timestamp`;
  }

  try {
    const [teacher_leaves] = await pool.query(query2, values2);
    // console.log(query2, values2, teacher_leaves)
    const [leaves] = await pool.query(query, values);
    res.json({ success: true, data: leaves, teacher_leaves, message: "leaves fetched" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err });
  }
})

// save leave
app.post("/upload-leave", async (req, res) => {
  const { applicant, subject, application, applicable_from, applicable_to } = req.body;

  const affected_days = getAffectedDays(applicable_from, applicable_to);

  let query = "";
  let values = [];
  if (applicant.role === "Student") {
    query = `insert into leaves (
      name, 
      year, 
      branch,
      student_id, 
      subject, 
      application, 
      applicable_from, 
      applicable_to, 
      status,
      affected_days
    ) select ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?
     where not exists (
      select 1 
      from leaves
      where student_id = ?
        and status = 'Pending'
     )`;
    values = [applicant?.name, applicant?.year, applicant?.branch, applicant?.student_id, subject, application, applicable_from, applicable_to, affected_days, applicant?.student_id];
  }

  try {
    const [response] = await pool.query(query, values);
    if (response.affectedRows === 0) {
      res.json({
        success: false,
        message: "You already have a pending leave request"
      });
    } else {
      res.json({
        success: true,
        message: "Leave submitted successfully"
      })
    }
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      res.json({ success: false, message: "Duplicate application found" })
      return;
    }
    console.log(err)
    res.json({ success: false, message: "error while submitting" })
  }
})


// verify leave ( reject approve )
app.get("/verify-leave", async (req, res) => {
  const {
    "x-action": action,
    "x-applicant": applicant,
    "x-verifier": verifierr,
  } = req.headers;

  const verifier = JSON.parse(verifierr);

  const query = `update leaves l set l.status = ? where l.student_id = ? 
  and exists (
    select 1
    from users u
    where u.teacher_id = ?
      and (u.role = 'Teacher' or u.role = 'HOD' or u.role = 'Director')
  )`

  try {
    const [response] = await pool.query(query, [action, applicant, verifier.teacher_id])

    if (response.affectedRows > 0) {
      res.json({ success: true, message: "successfully " + action });

      // notify user
      // fetch user fcm token
      const [tokens] = await pool.query("select fcm_token from users where student_id = ?", [applicant]);
      const token = tokens.length > 0 ? tokens[0].fcm_token : null;

      console.log(token)

      await notify(token, "Leave Verification", `Leave ${action} by ${verifier.role} - ${verifier.teacher_name}`);
    }

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "error occuered" });
  }
})

// teacher availability
app.post("/teacher-availability", async (req, res) => {
  const { applicant, leave_type, classes } = req.body;

  const affected_days = getAffectedDays(req.body.from || req.body.on, req.body.to || req.body.on);

  // console.log(req.body.from, new Date(req.body.from).toLocaleDateString(), formatDate(req.body.from), new Date(formatDate(req.body.from)).toLocaleDateString())

  const from = formatDate(req.body.from);
  const to = formatDate(req.body.to);
  const on = formatDate(req.body.on);

  // save leave to leaves table
  const query1 = `insert into leaves (
    name,  
    teacher_id, 
    subject, 
    application, 
    applicable_from, 
    applicable_to, 
    status,
    affected_days
  ) values (?, ?, ?, ?, ?, ?, ?, ?)`;

  const values1 = [applicant.name, applicant?.teacher_id, "Priviliged", "Priviliged", from || on, to || on, "Approved", affected_days];

  let query2 = "";
  let values2 = [];

  // if leave type = period
  if (leave_type == "period") {
    // Build tuple placeholders
    const tuplePlaceholders = classes.map(() => "(?, ?, ?, ?, ?, ?)").join(", ");

    // Flatten all values into one array
    const tupleValues = classes.flatMap(c => [
      c.day,
      c.period,
      c.code,
      c.branch,
      c.year,
      c.section
    ]);

    query2 = `UPDATE schedule
    SET cancelled = ?, cancelled_from = ?, cancelled_to = ?
    WHERE teacher_id = ?
      AND (day, period_id, subject_id, branch_id, year, section) IN (${tuplePlaceholders});
    `;

    values2 = [
      1,
      from,
      to,
      applicant.teacher_id,
      ...tupleValues
    ];
  } else {
    // if leave type day | duration then check for affected periods
    query2 = `update schedule set cancelled = ?, cancelled_from = ?, cancelled_to = ? where teacher_id = ? and day in (${affected_days.split(",").map(ad => "?").join(",")})`;

    values2 = [1, from || on, to || on, applicant.teacher_id, ...affected_days.split(",")];
  }

  try {
    const response1 = await pool.query(query1, values1);
    // console.log(response1);
    const response2 = await pool.query(query2, values2);

    // send notification to affected class
    // fetch affetected class
    let [classes] = await pool.query("select distinct * from schedule where day = ? and cancelled = 1 and teacher_id = ? and cancelled_from = ? and cancelled_to = ? order by year, period_id", ["Monday", applicant.teacher_id, from || on, to || on]);

    const notification = {};
    classes.forEach((clas) => {
      if (!notification[`${clas.branch_id}_${clas.year}_${clas.section}`]) {
        notification[`${clas.branch_id}_${clas.year}_${clas.section}`] = [clas];
      } else {
        notification[`${clas.branch_id}_${clas.year}_${clas.section}`].push(clas);
      }
    })

    Object.keys(notification).forEach(async (topic) => {
      // console.log(topic, `Period ${notification[topic].map((p => p.period_id)).join(", ")} of ${notification[topic][0].teacher_name} Cancelled`)

      await admin.messaging().send({
        topic: topic,
        notification: {
          title: "Class Cancelled",
          body: `Period ${notification[topic].map((p => p.period_id)).join(", ")} of ${notification[topic][0].teacher_name} Cancelled. From ${new Date(from || on).toLocaleDateString()} to ${new Date(to || on).toLocaleDateString()}`,
        },
        android: {
          notification: {
            sound: "notification",
            channelId: "push_notification"
          }
        }
      });
    })

    res.json({ success: true, message: "Leave saved successfully" });
  } catch (error) {
    console.log(error)
    if (error.code === "ER_DUP_ENTRY") {
      res.json({ success: false, message: "Already submitted or duplicate leave" });
    } else {
      res.json({ success: false, message: "Error occured" });
    }
  }
})


// fetch announcemetns
app.get("/announcements", async (req, res) => {
  const { year, branch, section } = req.query;

  console.log(year, branch, section)

  const query = `SELECT 
    title,
    body,
    created_by,
    status,
    created_at,
    delete_at
  FROM announcements
  WHERE status = 'Active'
    AND JSON_CONTAINS(target_year, JSON_ARRAY(?), '$.years')
    AND JSON_CONTAINS(target_branch, JSON_ARRAY(?), '$.branches')
    AND JSON_CONTAINS(target_section, JSON_ARRAY(?), '$.sections') 
    ORDER BY id DESC;
  `;
  const values = [year, branch, section];

  try {
    // set status expired
    await pool.query("update announcements set status = 'Expired' where current_timestamp > delete_at");

    const [announcements] = await pool.query(query, values);

    if (announcements.length > 0) {
      res.json({ success: true, data: announcements });
    } else {
      res.json({ success: true, data: [] });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, data: [] });
  }
})

// Announce 
app.post("/announce", async (req, res) => {
  const { title, body, status, target_year, target_branch, target_section, created_by, expires_at } = req.body;

  const query = "insert into announcements (title, body, created_by, target_year, target_branch, target_section, delete_at) values(?, ?, ?, ?, ?, ?, ?)"

  try {
    const response = await pool.query(query, [title, body, JSON.stringify(created_by), JSON.stringify({ years: target_year }), JSON.stringify({ branches: target_branch }), JSON.stringify({ sections: target_section }), expires_at.replace("T", " ")]);

    // send notification 
    const resp = await notifyGroup(title, body, target_year, target_branch, target_section, res);
    res.json({ success: true, message: "saved to server and notified to target: " });

  } catch (err) {
    console.log(err)
    res.json({ success: false, error: err });
  }
})


// save student utm credentials 
app.post("/save/utu-creds", async (req, res) => {
  const { collegeId, admissionId, courseId, branchId, durationId, startMonth, roll } = req.body;
  console.log(req.body)

  const notFound = Object.keys(req.body).filter(v => req.body[v] === "");
  console.log(notFound)

  // verify creds
  if (notFound.length > 0) {
    return res.status(400).json({ success: false, error: "Provide credentials " + notFound.join(" ") + "" });
  }

  // save creds
  const [result] = await pool.query("update users set collegeId = ?, admissionId = ?, courseId = ?, branchId = ?, semester = ?, start_month = ? where student_id = ?", [collegeId, admissionId, courseId, branchId, durationId, startMonth, roll]);

  if (result.affectedRows > 0) {
    res.status(200).json({ success: true, message: "credentials saved" });
  } else {
    res.status(200).json({ success: false, message: "Student not found" });
  }
})

// fetch attendance data function
async function fetchAttendance(creds) {
  const attendance = {
    attendance: [],
    report: {}
  };

  let newReq = 1;

  for (let i = parseInt(creds.startMonth); i <= new Date().getMonth(); i++) {
    const response = await axios.post(
      "https://online.uktech.ac.in/ums/Student/Public/ShowStudentAttendanceListByRollNoDOB",
      new URLSearchParams({
        CollegeId: creds.collegeId,
        CourseId: creds.courseId,
        BranchId: creds.branchId,
        CourseBranchDurationId: creds.durationId,
        StudentAdmissionId: creds.admissionId,
        DateOfBirth: "",
        SessionYear: "",
        RollNo: creds.roll,
        Year: new Date().getFullYear(),
        MonthId: i + 1
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const parsedTable = parseAttendanceTable(i, creds, response.data, newReq);
    if (newReq === 1) newReq = 0;

    attendance.attendance.push({
      month_id: i,
      month: new Date(new Date().getFullYear(), i, 1).toLocaleString("en-Gb", { month: "long" }),
      attendance: parsedTable.attendance,
    })
    attendance.report = parsedTable.report;
  }

  return attendance;
}

app.get("/fetch-attendance", async (req, res) => {
  if (!req.headers.creds) res.status(400).json({ success: false, error: "provide credentials !" })
  const creds = JSON.parse(req.headers.creds);
  const attendance = await fetchAttendance(creds);

  // console.log(attendance)
  res.json({ attendance })
})


// notify for next day timetable
// Night 10:00 pm
cron.schedule("0 22 * * *", () => {
  console.log("Running task at 10:00 PM every day");
  notifyTimetable();
}, { timezone: "Asia/Kolkata" })

// Morning 08:00 am
cron.schedule("0 8 * * *", () => {
  console.log("Running task at 08:00 AM every day");
  notifyTimetable();
}, { timezone: "Asia/Kolkata" })

async function notifyTimetable() {
  const years = [1, 2, 3, 4];
  const branches = ["CSE", "AI", "RA", "ME", "CE", "BCA"];
  const sections = ["A"];

  const topics = {};

  years.forEach(year => {
    const key = `${year}`;
    topics[key] = [];

    branches.forEach(branch => {
      // topics[key].push(`${branch}_${year}`);
      sections.forEach(async section => {
        topics[key].push(`${branch}_${year}_${section}`);
        const topic = `${branch}_${year}_${section}`;

        // send timetable notification
        const today = new Date();
        const dayName = today.toLocaleString('en-US', { weekday: 'long' });

        const [classes] = await pool.query("select period_id, subject_id, subject_name, teacher_name from schedule where year = ? and branch_id = ? and section = ? and day = ? order by period_id", [year, branch, section, dayName])

        let message = "";

        classes.forEach((clas) => {
          message += `${clas.period_id}) ${clas.subject_id} • ${clas.subject_name} - ${clas.teacher_name}\n`
        })

        if (classes.length > 0) {
          await admin.messaging().send({
            topic: topic,
            notification: {
              title: "Next Day Classes",
              body: message,
            },
            android: {
              notification: {
                sound: "notification",
                channelId: "push_notification"
              }
            }
          });
        }
      });
    });
  });
}

// route all client endpoints to react build files except api calls
app.use(express.static(path.join(__dirname, "build")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// ✅ Start server
const PORT = 8000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));




// helpers

function generateOTP() {
  const otp = crypto.randomInt(100000, 1000000);
  return otp.toString();
}


async function notifyGroup(title, body, target_year, target_branch, target_section) {
  return new Promise(async (resolve, reject) => {

    const YEARS = ["1", "2", "3", "4"];
    const BRANCHES = ["CSE", "AI", "RA", "ME", "CE", "BCA"];
    const SECTIONS = ["A", "B", "C"];

    const years =
      target_year.includes("all") ? YEARS : target_year;

    const branches =
      target_branch.includes("all") ? BRANCHES : target_branch;

    const sections =
      target_section.includes("all") ? SECTIONS : target_section;

    const topics = [];

    for (const branch of branches) {
      for (const year of years) {
        for (const section of sections) {
          topics.push(`${branch}_${year}_${section}`);
        }
      }
    }

    // console.log(topics);


    topics.forEach(async (topic) => {
      await admin.messaging().send({
        topic: topic,

        notification: {
          title: title,
          body: body,
        },

        android: {
          notification: {
            sound: "notification",
            channelId: "push_notification"
          }
        }
      });
    })

    resolve({ success: true })
  })
}


async function notify(token, title, body, data) {
  const message = {
    token,
    notification: {
      title: title,
      body: body,
    },
    android: {
      notification: {
        sound: "notification",
        channelId: "push_notification"
      }
    },
    data: data
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Notification sent:", response);
    return response;
  } catch (err) {
    console.error("FCM error:", err.message);
  }
}

function getAffectedDays(from, to, timeZone = "Asia/Kolkata") {
  const days = new Set();

  const start = new Date(from);
  const end = new Date(to);

  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone
  });

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.add(formatter.format(d));
  }

  return [...days].join(",");
}

const formatDate = (date) => {
  if (!date) return undefined;
  return new Date(date)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
};

// update schedule set cancelled = 0, cancelled_from = NULL, cancelled_to = NULL;
