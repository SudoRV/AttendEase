const pool = require("../config/mysql");
const admin = require("../config/fcm");
const { buildFcmTopicsByTarget } = require("../utils/buildFcmTopics");

exports.postAnnouncement = async (req, res) => {
    const { title, body, status, created_by, target_college, target_course, target_branch, target_year, target_section, scope, expires_at } = req.body;

    // console.log(target_college, target_course, target_branch, target_year, target_section)

    const query = "insert into announcements (title, body, created_by, scope, target_college, target_course, target_branch, target_year, target_section, expires_at) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

    try {
        const response = await pool.query(query, [title, body, JSON.stringify(created_by), scope, target_college, JSON.stringify({ courses: target_course }), JSON.stringify({ branches: target_branch }), JSON.stringify({ years: target_year }), JSON.stringify({ sections: target_section }), new Date(expires_at)]);

        // send notification 
        await notifyGroup(title, body, "ANNOUNCEMENT", {
            metadata: JSON.stringify({
                scope,
                target_college, target_course,
                target_branch, target_year, target_section,
            })
        }, target_college, target_course, target_branch, target_year, target_section, scope);
        res.json({ success: true, message: "saved to server and notified to target: " });

    } catch (err) {
        console.log(err)
        res.json({ success: false, message: "Something went wrong." });
    }
}

exports.announcements = async (req, res) => {
    const { role, teacher_id, college_id, course_id, branch, year, section, time } = req.query;

    // console.log(req.query)

    const query = `
      SELECT 
          title,
          body,
          created_by,
          scope,
          status,
          created_at,
          expires_at
      FROM announcements
      WHERE status = 'Active'
        AND expires_at > ?
        AND target_college = ?
        AND (
          (           
            (JSON_CONTAINS(target_course, JSON_ARRAY(?), '$.courses')
            OR JSON_CONTAINS(target_course, JSON_ARRAY('all'), '$.courses'))
        
            AND (JSON_CONTAINS(target_year, JSON_ARRAY(?), '$.years') 
            OR JSON_CONTAINS(target_year, JSON_ARRAY('all'), '$.years'))
  
            AND (JSON_CONTAINS(target_branch, JSON_ARRAY(?), '$.branches')
            OR JSON_CONTAINS(target_branch, JSON_ARRAY('all'), '$.branches'))
              
            AND (JSON_CONTAINS(target_section, JSON_ARRAY(?), '$.sections')
            OR JSON_CONTAINS(target_section, JSON_ARRAY('all'), '$.sections'))
          )
          OR JSON_EXTRACT(created_by, '$.id') = ?
          OR scope = ?
        )
      ORDER BY created_at DESC;
  `;

    const values = [
        new Date(time),
        college_id,
        course_id,
        year,
        branch,
        section,
        teacher_id,
        role === "Teacher" ? "teachers" : "students"
    ];

    try {
        // set status expired
        await pool.query("update announcements set status = 'Expired' where current_timestamp > expires_at");
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