const pool = require("../config/mysql");
const admin = require("../config/fcm");
const { buildFcmTopicsByTarget } = require("../utils/buildFcmTopics");

// fetch student timetable
exports.studentTimetable = async (req, res) => {
  const { day, branch, year, semester, section = "A" } = req.query;
  const { college_id, course_id } = req.user;

  if (day === "null") {
    const query = `select * from schedule where college_id = ? and course_id = ? and year = ? and semester = ? and branch_id = ? and section = ? order by day, period_id`;
    const [rows] = await pool.query(query, [
      college_id, course_id, year, semester, branch, section
    ]);

    let timetable = {};
    rows.forEach(row => {
      if (!timetable[row.day]) {
        timetable[row.day] = [];
      }
      timetable[row.day].push(row);
    });

    res.json({
      success: true,
      timetable
    });

  } else {
    const query = `select * from schedule where college_id = ? and course_id = ? and year = ? and semester = ? and branch_id = ? and section = ? and day = ? order by period_id`;
    const [classes] = await pool.query(query, [
      college_id, course_id, year, semester, branch, section, day
    ]);

    res.json({
      success: true,
      message: "thrown classes",
      data: { day: day, classes: classes }
    })
  }
}

// fetch teacher timetable
exports.teacherTimetable = async (req, res) => {
  const { day, teacher_id } = req.query;

  // whole week timetable
  if (day === "null") {
    const query = `select * from schedule where college_id = ? and teacher_id = ? order by period_id group by day`;
    const [rows] = await pool.query(query, [req.user.college_id, teacher_id]);

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
      timetable
    });
  }
  // specific day timetable
  else {
    const query = `select * from schedule where college_id = ? and teacher_id = ? and day = ? order by period_id`;
    const [classes] = await pool.query(query, [req.user.college_id, teacher_id, day
    ]);

    res.json({
      success: true,
      data: { day: day, classes: classes }
    })
  }
}

// set substitution
exports.setSubstitution = async (req, res) => {
  const { class_id, substitutee, substituted_till, action } = req.body;
  const substitutor = req.user;

  // check if substitute teacher exists or not 
  const [substitutionTeachers] = await pool.query("select teacher_id from users where teacher_id in (?)", [[substitutor.teacher_id, substitutee.teacher_id]]);

  if (!!substitutionTeachers.find(tid => tid.teacher_id === substitutor.teacher_id)?.id) {
    let result;
    // substitution cancelled
    if (action === "cancel") {
      [result] = await pool.query("update schedule set substitute_teacher_id = ?, substitute_teacher_name = ?, substituted_till = ? where id = ?", [null, null, null, class_id]);

    } else {
      // substitution acquired
      // update database
      [result] = await pool.query("update schedule set substitute_teacher_id = ?, substitute_teacher_name = ?, substituted_till = ? where id = ?", [substitutor.teacher_id, substitutor.name, substituted_till, class_id]);
    }

    if (result?.affectedRows > 0) {
      res.status(200).json({ success: true, message: (action === "acquired" ? "Class substituted successfully" : "Substitution cancelled.") });

      //notify students
      const [substitutedClass] = await pool.query("select s.period_id, s.subject_id, s.subject_name, s.teacher_id, u.name as teacher_name, s.college_id, s.course_id, s.branch_id, s.year, s.section from schedule s inner join users u on s.teacher_id = u.teacher_id where id = ?", [class_id]);

      const message = action === "acquired" ? `Class ${substitutedClass[0].subject_name} of ${substitutedClass[0].teacher_name} is substituted by ${substitutor.name}` : `Substitution of class ${substitutedClass[0].subject_name} cancelled by ${substitutor.name}`;

      // notify students
      if (substitutedClass[0]?.subject_id) {
        notifyGroup("Class Substitution", message, "CLASS_SUBSTITUTION", {
          metadata: JSON.stringify({
            status: action === "acquired" ? "1" : "0",
            period_id: substitutedClass[0].period_id,
            substitutor: substitutor.teacher_id
          })
        }, [substitutedClass[0].college_id], [substitutedClass[0].course_id], [substitutedClass[0].branch_id], [substitutedClass[0].year], [substitutedClass[0].section], "students");
      }

      // notify absent teacher
      const substituteeUserId = substitutionTeachers.find(tid => tid.teacher_id === substitutee.teacher_id).id;

      if (!!substituteeUserId) {
        const [absentTeacher] = await pool.query("select * from fcm_tokens where user_id = ?", [substituteeUserId]);

        const tokens = absentTeacher.map(at => at.fcm_token);

        if(tokens.length <= 0) return;

        const message = {
          data: {
            type: "CLASS_SUBSTITUTION",
            title: `Substitution ${action === "acquired" ? "acquired" : "cancelled"}`,
            body: action === "acquired" ? `Your class ${substitutedClass[0].subject_name} acquired by ${substitutor.name}` : `Your class ${substitutedClass[0].subject_name} substitution cancelled by ${substitutor.name}`,
            scope: "Individual"
          },
          tokens: tokens,

          android: {
            priority: "high",
          },

          webpush: {
            headers: {
              Urgency: "high"
            },

            notification: {
              title: `Substitution ${action === "acquired" ? "acquired" : "cancelled"}`,
              body: action === "acquired" ? `Your class ${substitutedClass[0].subject_name} acquired by ${substitutor.name}` : `Your class ${substitutedClass[0].subject_name} substitution cancelled by ${substitutor.name}`,
            },

            fcmOptions: {
              link: "https://attendease-nivr.onrender.com/"
            }
          }
        };

        const response = await admin.messaging().sendEachForMulticast(message);
      }

    } else {
      res.status(400).json({ success: false, message: "Something went wrong." });
    }
  } else {
    res.status(400).json({ success: false, message: "Substitutor doesn't exist." });
  }
}

// add class to timetable
exports.addClass = async (req, res) => {
  const { subject_data } = req.body;

  const insertQuery = `insert into schedule (${Object.keys(subject_data?.changes).map(key => `${key}`).join(", ")}) values (${Object.keys(subject_data?.changes).map(key => "?").join(", ")})`;
  const values = Object.values(subject_data?.changes);

  try {
    const [result] = await pool.query(insertQuery, values);
    if (result.affectedRows > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Internal server error" });
  }
}

// update class
exports.updateClass = async (req, res) => {
  const { subject_data } = req.body;
  console.log(subject_data)

  const updateQuery = `update schedule set ${Object.keys(subject_data?.changes).map(key => `${key} = ?`).join(", ")} where id = ?`;
  const values = [...Object.values(subject_data?.changes), subject_data.id];

  try {
    const [result] = await pool.query(updateQuery, values);
    if (result.affectedRows > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Internal server error" });
  }
}

// delete class
exports.deleteClass = async (req, res) => {
  const { subject_data } = req.body;

  const deleteQuery = "delete from schedule where id = ?";
  const values = [subject_data.id];

  try {
    const [result] = await pool.query(deleteQuery, values);
    if (result.affectedRows > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Internal server error" });
  }
}




async function notifyGroup(title, body, dataType, data, target_college, target_courses, target_branches, target_years, target_sections, scope) {
  return new Promise(async (resolve, reject) => {

    // console.log(target_college, target_courses, target_branches, target_years, target_sections, scope, "target")
    const topics = await buildFcmTopicsByTarget(target_college, target_courses, target_branches, target_years, target_sections, scope, "target");

    // console.log(topics)

    topics.forEach(async (topic) => {
      await admin.messaging().send({
        topic: topic,

        data: {
          type: dataType,
          title: title,
          body: body,
          scope: topic,
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

      });
    })

    resolve({ success: true })
  })
}
