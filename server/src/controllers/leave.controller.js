const pool = require("../config/mysql");
const admin = require("../config/fcm");
const { clean } = require("../utils/buildFcmTopics");

exports.submitStudentLeave = async (req, res) => {
    const { subject, application, applicable_from, applicable_to } = req.body;
    const applicant = req.user;

    const affected_days = getAffectedDays(applicable_from, applicable_to);

    let query = "";
    let values = [];
    // student leave
    if (applicant.role === "Student") {
        query = `insert into leaves (
        user_id,
        subject, 
        application, 
        applicable_from, 
        applicable_to, 
        status,
        affected_days
      ) select ?, ?, ?, ?, ?, 'Pending', ?
       where not exists (
        select 1 
        from leaves
        where id = ?
          and status = 'Pending'
          and applicable_from = ?
          and applicable_to = ?
       )`;
        values = [applicant?.id, subject, application, new Date(applicable_from), new Date(applicable_to), affected_days, applicant?.id, new Date(applicable_from), new Date(applicable_to)];
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
            res.json({ success: false, message: "Duplicate application found" });
            return;
        }
        console.log(err);
        res.json({ success: false, message: "error while submitting" })
    }
}

exports.studentsLeaves = async (req, res) => {
    const { filter: leaveFilter, time } = req.query;
    const user = req.user;

    let filter = {};
    if (leaveFilter) {
        filter = JSON.parse(leaveFilter);
    } else {
        filter = { month: new Date().getMonth() };
    }

    // student leaves
    let studentLeavesQuery;
    let studentValues;

    if (user?.role === "Student") {
        studentLeavesQuery = `
        select l.id, l.user_id, u.name, u.year, u.branch_id, u.student_id, l.subject, l.application, l.applicable_from, l.applicable_to, l.status, l.created_at 
        from leaves l left join users u on l.user_id = u.id 
        where l.user_id = ? 
        and month(l.created_at) = ? 
        and year(l.created_at) = year(current_date()) 
        order by l.created_at desc`;
        studentValues = [user?.id, filter.month + 1];
    } else {
        studentLeavesQuery = `
        SELECT l.id, l.user_id, u.name, u.year, u.branch_id, u.student_id, l.subject, l.application, l.applicable_from, l.applicable_to, l.status, l.created_at,
        COUNT(*) OVER (PARTITION BY l.id) AS total_leaves
        FROM leaves l left join users u on l.user_id = u.id
        WHERE u.college_id = ? AND l.applicable_to > ? 
          AND EXISTS (
            SELECT 1
            FROM schedule s
            WHERE s.teacher_id = ?
              AND s.year = u.year
              AND s.branch_id = u.branch_id
              AND s.section = u.section
              AND FIND_IN_SET(s.day, l.affected_days)
          )
        ORDER BY l.created_at DESC`;
        studentValues = [user?.college_id, new Date(time), user?.teacher_id]
    }

    try {
        const [studentLeaves] = await pool.query(studentLeavesQuery, studentValues);
        res.json({ success: true, message: "leaves fetched successfully.", leaves: studentLeaves });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: err });
    }
}

exports.verifyStudentLeave = async (req, res) => {
    const { action, application } = req.body;
    const verifier = req.user;

    if (verifier.role !== "Teacher") return res.status(401).json({ success: false, message: "Unauthorized access!" });

    const query = `update leaves l set l.status = ? where l.id = ? and exists (
      select 1
      from users u
      where u.teacher_id = ?
        and (u.role = 'Teacher' or u.role = 'HOD' or u.role = 'Director')
    )`

    try {
        const [response] = await pool.query(query, [action, application?.id, verifier.teacher_id])

        if (response.affectedRows > 0) {
            res.json({ success: true, message: "successfully " + action });

            // notify user
            // fetch user fcm token
            const [tokens] = await pool.query(`select f.fcm_token from fcm_tokens f join users u on f.user_id = u.id where u.student_id = ?`, [application.student_id]);

            if (tokens.length) {
                await notify(tokens, "Leave Verification", `Leave ${action} by ${verifier.role} - ${verifier?.name}`, "LEAVE_STATUS", { scope: "INDIVIDUAL" });
            }

            return;
        } res.json({ success: false, message: "No leave exists or Internal server error!" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "error occuered" });
    }
}

exports.submitTeacherLeaves = async (req, res) => {
    const { leave_type, classes } = req.body;
    const applicant = req.user;

    if (req.user.role !== "Teacher") return res.status(401).json({ success: false, message: "Unauthorized access!" });

    const affected_days = getAffectedDays(req.body.from || req.body.on, req.body.to || req.body.on);

    const from = new Date(req.body.from);
    const to = new Date(req.body.to);
    const on = new Date(req.body.on);

    // save leave to leaves table
    const query1 = `insert into leaves (
      user_id, 
      subject, 
      application, 
      applicable_from, 
      applicable_to, 
      status,
      affected_days
    ) values (?, ?, ?, ?, ?, ?, ?)`;

    const values1 = [applicant?.id, "Leave", "Priviliged", from, to, "Approved", affected_days];

    let query2 = "";
    let values2 = [];

    // if leave type = period
    if (leave_type == "period") {
        query2 = `UPDATE schedule
      SET cancelled = ?, cancelled_from = ?, cancelled_to = ?
      WHERE teacher_id = ?
        AND id IN (${classes?.map(c => "?").join(", ")});
      `;

        values2 = [
            1,
            from,
            to,
            applicant.teacher_id,
            ...classes?.map(c => c.id)
        ];

    } else {
        // if leave type day | duration then check for affected periods
        query2 = `update schedule set cancelled = ?, cancelled_from = ?, cancelled_to = ? where teacher_id = ? and day in (${affected_days.split(",").map(ad => "?").join(",")})`;

        values2 = [1, from, to, applicant.teacher_id, ...affected_days.split(",")];
    }

    try {
        // check for duplicates for leave type period
        const [leaveExists] = await pool.query("select id from leaves where user_id = ? and applicable_from = ? and applicable_to = ?", [applicant.id, from, to]);

        if (leaveExists.length === 0) {
            const response1 = await pool.query(query1, values1);
        }
        const response2 = await pool.query(query2, values2);

        // send notification to affected class
        // fetch affetected class
        let [affectedClasses] = await pool.query(`select distinct * from schedule where cancelled = 1 and teacher_id = ? and cancelled_from = ? AND day = ? order by year, period_id`, [applicant.teacher_id, new Date(from), new Date(from).toLocaleString("en-Gb", {
            weekday: "long"
        })]);

        // notify affected students
        const groupedClasses = {};
        for (const affectedClass of affectedClasses) {
            const key = `${affectedClass?.course_id}_${affectedClass?.branch_id}_${affectedClass?.year}_${affectedClass?.section}`;
            if (!groupedClasses[key]) {
                groupedClasses[key] = [affectedClass];
            } else {
                groupedClasses[key].push(affectedClass);
            }
        }

        Object.keys(groupedClasses).forEach(async (key) => {
            // const scope = key.split("_");
            const message = `Period ${groupedClasses[key]
                .map((p) => p.period_id)
                .join(", ")} of ${groupedClasses[key][0].teacher_name} cancelled, on leave ${new Date(from).toDateString() === new Date(to).toDateString()
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

            // const condition = `'COLLEGE_${groupedClasses[key][0]?.college_id}' in topics && 'COURSE_${scope[0]}' in topics && 'BRANCH_${scope[1]}' in topics && 'YEAR_${scope[2]}' in topics && 'SECTION_${scope[3]}' in topics`;

            await admin.messaging().send({
                topic: clean(`COLLEGE_${applicant.college_id}_${key}`),
                data: {
                    type: "CLASS_CANCELLED",
                    title: "Class Cancelled",
                    metadata: JSON.stringify({
                        leave_type,
                        status: "1",
                        teacher_id: applicant.teacher_id,
                        period_id: groupedClasses[key]
                            .map((p) => p.period_id),
                        on, from, to
                    }),
                    body: message,
                    scope: clean(key),
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
    const user = req.user;

    let filter = {};
    if (leaveFilter) {
        filter = JSON.parse(leaveFilter);
    } else {
        filter = { month: new Date().getMonth() };
    }

    // teacher leaves
    let teacherLeavesQuery;
    let teacherValues;

    if (user?.role === "Teacher") {
        teacherLeavesQuery = `select u.teacher_id, l.id, u.name, l.applicable_from, l.applicable_to, l.status from leaves l left join users u on l.user_id = u.id where u.college_id = ? and u.teacher_id != 'not a teacher' and l.applicable_to > ?`;
        teacherValues = [user?.college_id, new Date(time)];
    } else {
        teacherLeavesQuery = `
        SELECT DISTINCT l.id, u.teacher_id, u.name, l.applicable_from, l.applicable_to, l.status
        FROM leaves l 
        left join users u on l.user_id = u.id
        JOIN schedule s ON u.teacher_id = s.teacher_id
        WHERE u.college_id = ?
          AND s.year = ? 
          AND s.branch_id = ? 
          AND s.section = ?
          AND applicable_to > ?`;
        teacherValues = [user?.college_id, user.year, user.branch_id, user.section || "A", new Date(time)];
    }

    try {
        const [teacherLeaves] = await pool.query(teacherLeavesQuery, teacherValues);
        res.json({ success: true, leaves: teacherLeaves, message: "leaves fetched" });
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

async function notify(tokens, title, body, dataType, data) {
    const message = {
        tokens,
        data: {
            type: dataType,
            title,
            body,
            ...data
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
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log("Notification sent:", response);
        return response;
    } catch (err) {
        console.error("FCM error:", err.message);
    }
}