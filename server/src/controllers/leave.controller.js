const pool = require("../config/mysql");
const admin = require("../config/fcm");

exports.submitStudentLeave = async (req, res) => {
    const { subject, application, applicable_from, applicable_to } = req.body;
    const applicant = req.user;

    const affected_days = getAffectedDays(applicable_from, applicable_to);

    let query = "";
    let values = [];
    // student leave
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
          and applicable_from = ?
          and applicable_to = ?
       )`;
        values = [applicant?.name, applicant?.year, applicant?.branch_id, applicant?.student_id, subject, application, new Date(applicable_from), new Date(applicable_to), affected_days, applicant?.student_id, new Date(applicable_from), new Date(applicable_to)];
    }

    try {
        const [response] = await pool.query(query, values);
        console.log(response)
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
            res.json({ success: false, message: "Duplicate application found" });
            return;
        }
        console.log(err);
        res.json({ success: false, message: "error while submitting" })
    }
}

exports.verifyStudentLeave = async (req, res) => {
    const { action, applicant } = req.body;
    const verifier = req.user;

    if (req.user.role !== "Teacher") return res.status(401).json({success: false, message: "Unauthorized access!"});

    const query = `update leaves l set l.status = ? where l.student_id = ? 
    and id = ? and exists (
      select 1
      from users u
      where u.teacher_id = ?
        and (u.role = 'Teacher' or u.role = 'HOD' or u.role = 'Director')
    )`

    try {
        const [response] = await pool.query(query, [action, applicant?.student_id, applicant?.id, verifier.teacher_id])

        if (response.affectedRows > 0) {
            res.json({ success: true, message: "successfully " + action });

            // notify user
            // fetch user fcm token

            const [tokens] = await pool.query(`select f.fcm_token, f.active from fcm_tokens f join users u on f.user_id = u.user_id where u.student_id = ?`, [applicant.student_id]);

            tokens.forEach(async (token) => {
                if (token.active) {
                    await notify(token.fcm_token, "Leave Verification", `Leave ${action} by ${verifier.role} - ${verifier.teacher_name}`, "LEAVE_STATUS", null);
                }
            })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "error occuered" });
    }
}

exports.studentsLeaves = async (req, res) => {
    const { filter: leaveFilter, time } = req.query;
    const userData = req.user;

    let filter = {};
    if (leaveFilter) {
        filter = JSON.parse(leaveFilter);
    } else {
        filter = { month: new Date().getMonth() };
    }

    // student leaves
    let studentLeavesQuery;
    let studentValues;

    if (userData?.role === "Student") {
        studentLeavesQuery = `
        select id, name, year, branch, student_id, subject, application, applicable_from, applicable_to, status, created_at 
        from leaves 
        where student_id = ? 
        and month(created_at) = ? 
        and year(created_at) = year(current_date()) 
        order by created_at desc`;
        studentValues = [userData?.student_id, filter.month + 1];
    } else {
        studentLeavesQuery = `
        SELECT l.id, l.name,l.year, l.branch, l.student_id, l.subject, l.application, l.applicable_from, l.applicable_to, l.status, l.created_at,
        COUNT(*) OVER (PARTITION BY l.student_id) AS total_leaves
        FROM leaves l
        WHERE l.applicable_to > ? 
          AND EXISTS (
            SELECT 1
            FROM schedule s
            WHERE s.teacher_id = ?
              AND s.year = l.year
              AND s.branch_id = l.branch
              AND s.section = l.section
              AND FIND_IN_SET(s.day, l.affected_days)
          )
        ORDER BY l.created_at DESC;`;
        studentValues = [new Date(time), userData?.teacher_id]
    }

    try {
        const [studentLeaves] = await pool.query(studentLeavesQuery, studentValues);
        res.json({ success: true, message: "leaves fetched successfully.", leaves: studentLeaves });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: err });
    }
}

exports.submitTeacherLeaves = async (req, res) => {
    const { leave_type, classes } = req.body;
    const applicant = req.user;

    if (req.user.role !== "Teacher") return res.status(401).json({success: false, message: "Unauthorized access!"});

    const affected_days = getAffectedDays(req.body.from || req.body.on, req.body.to || req.body.on);

    const from = new Date(req.body.from);
    const to = new Date(req.body.to);
    const on = new Date(req.body.on);

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

    const values1 = [applicant.name, applicant?.teacher_id, "Priviliged", "Priviliged", from, to, "Approved", affected_days];

    let query2 = "";
    let values2 = [];

    // if leave type = period
    if (leave_type == "period") {
        // Build tuple placeholders
        const tuplePlaceholders = classes.map(() => "(?, ?, ?, ?, ?, ?)").join(", ");

        // Flatten all values into one array
        const tupleValues = classes.flatMap(c => [
            c.day,
            c.period_id,
            c.subject_id,
            c.branch_id,
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

        values2 = [1, from, to, applicant.teacher_id, ...affected_days.split(",")];
    }

    try {
        // check for duplicates for leave type period
        const [leaveExists] = await pool.query("select * from leaves where teacher_id = ? and applicable_from = ? and applicable_to = ?", [applicant.teacher_id, from, to]);

        if (leaveExists.length === 0) {
            const response1 = await pool.query(query1, values1);
        }
        const response2 = await pool.query(query2, values2);

        const currentDate = new Date(new Date().toDateString());
        const fromDate = new Date(new Date(from).toDateString());
        const toDate = new Date(new Date(to).toDateString());


        // send notification to affected class
        // fetch affetected class
        let [affectedClasses] = await pool.query(`select distinct * from schedule where cancelled = 1 and teacher_id = ? and cancelled_from = ? AND day = ? order by year, period_id`, [applicant.teacher_id, new Date(from), new Date(from).toLocaleString("en-Gb", {
            weekday: "long"
        })]);

        // notify affected students
        const notification = {};
        affectedClasses.forEach((clas) => {
            if (!notification[`${clas.branch_id}_${clas.year}_${clas.section}`]) {
                notification[`${clas.branch_id}_${clas.year}_${clas.section}`] = [clas];
            } else {
                notification[`${clas.branch_id}_${clas.year}_${clas.section}`].push(clas);
            }
        })

        Object.keys(notification).forEach(async (topic) => {
            // console.log(topic, `Period ${notification[topic].map((p => p.period_id)).join(", ")} of ${notification[topic][0].teacher_name} Cancelled`)

            const message = `Period ${notification[topic]
                .map((p) => p.period_id)
                .join(", ")} of ${notification[topic][0].teacher_name} cancelled, on leave ${new Date(from).toDateString() === new Date(to).toDateString()
                    ? `for ${new Date(from).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })}`
                    : `from ${new Date(from).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })} to ${new Date(to).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })}`
                }`;

            await admin.messaging().send({
                topic: topic,
                data: {
                    type: "CLASS_CANCELLED",
                    title: "Class Cancelled",
                    metadata: JSON.stringify({
                        leave_type,
                        status: "1",
                        teacher_id: applicant.teacher_id,
                        period_id: notification[topic]
                            .map((p) => p.period_id),
                        on, from, to
                    }),
                    body: message,
                    scope: topic,
                },

                android: {
                    priority: "high",
                },

                webpush: {
                    headers: {
                        Urgency: "high"
                    },

                    notification: {
                        title: "Class Cancelled",
                        body: message,
                    },

                    fcmOptions: {
                        link: "https://attendease-nivr.onrender.com/"
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
}

exports.teachersLeaves = async (req, res) => {
    const { filter: leaveFilter, time } = req.query;
    const userData = req.user;

    let filter = {};
    if (leaveFilter) {
        filter = JSON.parse(leaveFilter);
    } else {
        filter = { month: new Date().getMonth() };
    }

    // teacher leaves
    let teacherLeavesQuery;
    let teacherValue;

    if (userData?.role === "teacher") {
        teacherLeavesQuery = `select teacher_id, id, name, applicable_from, applicable_to, status from leaves where teacher_id != 'not a teacher' and applicable_to > ?`;
        teacherValue = [new Date(time)];
    } else {
        teacherLeavesQuery = `
        SELECT DISTINCT l.id, l.teacher_id, l.name, l.applicable_from, l.applicable_to, l.status
        FROM leaves l
        JOIN schedule s ON l.teacher_id = s.teacher_id
        WHERE s.year = ? 
          AND s.branch_id = ? 
          AND s.section = ?
          AND applicable_to > ?`;
        teacherValues = [userData.year, userData.branch_id, userData.section || "A", new Date(time)];
    }

    try {
        const [teacherLeaves] = await pool.query(teacherLeavesQuery, teacherValues);
        res.json({ success: true, teacher: teacherLeaves, message: "leaves fetched" });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: err });
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

async function notify(token, title, body, dataType, data) {
  const message = {
    token,
    data: {
      type: dataType,
      title,
      body,
      data: JSON.stringify(data)
    },

    android: {
      priority: "high",
    },

    webpush: {
      headers: {
        Urgency: "high"
      },

      notification: {
        title,
        body,
      },

      fcmOptions: {
        link: "https://attendease-nivr.onrender.com/"
      }
    }

  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Notification sent:", response);
    return response;
  } catch (err) {
    console.error("FCM error:", err.message);
  }
}