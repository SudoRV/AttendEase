const pool = require("../config/mysql");
const admin = require("../config/fcm");

exports.postAnnouncement = async (req, res) => {
    const { title, body, status, target_year, target_branch, target_section, scope, expires_at } = req.body;
    const created_by = req.user;

    const query = "insert into announcements (title, body, created_by, scope, target_year, target_branch, target_section, expires_at) values(?, ?, ?, ?, ?, ?, ?, ?)"

    try {
        const response = await pool.query(query, [title, body, JSON.stringify(created_by), scope, JSON.stringify({ years: target_year }), JSON.stringify({ branches: target_branch }), JSON.stringify({ sections: target_section }), new Date(expires_at)]);

        // send notification 
        const resp = await notifyGroup(title, body, "ANNOUNCEMENT", {
            metadata: JSON.stringify({
                scope,
                target_year,
                target_branch,
                target_section,
            })
        }, target_year, target_branch, target_section, scope);
        res.json({ success: true, message: "saved to server and notified to target: " });

    } catch (err) {
        console.log(err)
        res.json({ success: false, message: "Something went wrong." });
    }
}

exports.announcements = async (req, res) => {
    const { role, teacher_id, year, branch, section, time } = req.query;

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
        AND (
          (
              (JSON_CONTAINS(target_year, JSON_ARRAY(?), '$.years') 
              OR JSON_CONTAINS(target_year, JSON_ARRAY('all'), '$.years'))
  
              AND (JSON_CONTAINS(target_branch, JSON_ARRAY(?), '$.branches') OR JSON_CONTAINS(target_branch, JSON_ARRAY('all'), '$.branches'))
              
              AND (JSON_CONTAINS(target_section, JSON_ARRAY(?), '$.sections') OR JSON_CONTAINS(target_section, JSON_ARRAY('all'), '$.sections'))
          )
          OR JSON_EXTRACT(created_by, '$.id') = ?
          OR scope = ?
        )
      ORDER BY created_at DESC;
  `;

    const values = [
        new Date(time),
        year,
        branch,
        section,
        teacher_id,
        role === "Teacher" ? "teachers" : "null"
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

async function notifyGroup(title, body, dataType, data, target_year, target_branch, target_section, scope) {
  return new Promise(async (resolve, reject) => {

    let topics = []

    if (scope === "students") {
      const YEARS = ["1", "2", "3", "4"];
      const BRANCHES = ["CSE", "AI", "RA", "ME", "CE", "BCA"];
      const SECTIONS = ["A", "B", "C"];

      const years =
        target_year.includes("all") ? YEARS : target_year;

      const branches =
        target_branch.includes("all") ? BRANCHES : target_branch;

      const sections =
        target_section.includes("all") ? SECTIONS : target_section;

      for (const branch of branches) {
        for (const year of years) {
          for (const section of sections) {
            topics.push(`${branch}_${year}_${section}`);
          }
        }
      }
    } else {
      topics.push("teachers");
    }

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