const pool = require("../config/mysql");
const admin = require("../config/fcm");
const { clean, buildFcmTopicsByTarget } = require("../utils/buildFcmTopics");

exports.postAnnouncement = async (req, res) => {
  const { title, body, status, created_by, target_college, target_course, target_branch, target_year, target_section, scope, expires_at } = req.body;

  console.log(target_college, target_course, target_branch, target_year, target_section)

  const query = "insert into announcements (title, body, created_by, scope, target_college, target_course, target_branch, target_year, target_section, expires_at) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

  try {
    const response = await pool.query(query, [title, body, JSON.stringify(created_by), scope, target_college, JSON.stringify({ courses: target_course }), JSON.stringify({ branches: target_branch }), JSON.stringify({ years: target_year }), JSON.stringify({ sections: target_section }), new Date(expires_at)]);

    res.json({ success: true, message: "saved to server and notified to target: " });

    // send notification 
    await notifyGroup(title, body, "ANNOUNCEMENT", {
      metadata: JSON.stringify({
        scope,
        target_college, target_course,
        target_branch, target_year, target_section,
      })
    }, target_college, target_course, target_branch, target_year, target_section, scope);

  } catch (err) {
    console.log(err)
    res.json({ success: false, message: "Something went wrong." });
  }
}

exports.announcements = async (req, res) => {
  const { role, teacher_id, college_id, course_id, branch, year, section, time } = req.query;

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

    const condition = scope === "students" ? `
    'COLLEGE_${target_college}' in topics 
    ${!target_courses.includes("all") ? `&& (${target_courses.map(c => `'COURSE_${clean(c)}' in topics`).join(" || ")})` : ""} 
    ${!target_branches.includes("all") ? `&& (${target_branches.map(b => `'BRANCH_${clean(b)}' in topics`).join(" || ")})` : ""}
    ${!target_years.includes("all") ? `&& (${target_years.map(y => `'YEAR_${clean(y)}' in topics`).join(" || ")})` : ""}
    ${!target_sections.includes("all") ? `&& (${target_sections.map(s => `'SECTION_${clean(s)}' in topics`).join(" || ")})` : ""}
    `.trim() : `'COLLEGE_${target_college}' in topics && 'TEACHERS' in topics`;

    const operatorsCount = (condition.match(/in/g) || []).length;

    const message = {
      data: {
        type: dataType,
        title: title,
        body: body,
        scope: JSON.stringify({
          courses: target_courses,
          branches: target_branches,
          years: target_years,
          sections: target_sections
        }),
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
    }

    if (operatorsCount <= 5) {
      await admin.messaging().send({
        condition,
        ...message
      });
    } else {
      // fetch tokens of each user
      let query = `
        SELECT f.fcm_token 
        FROM fcm_tokens f 
        LEFT JOIN users u 
        ON f.user_id = u.id
        WHERE u.college_id = ?   
      `;
      const params = [
        target_college
      ];

      if(!target_courses?.includes("all")){
        query += "AND u.course_id in (?)\n";
        params.push(target_courses);
      }
      if(!target_branches?.includes("all")){
        query += "AND u.branch_id in (?)\n";
        params.push(target_branches);
      }
      if(!target_years?.includes("all")){
        query += "AND u.year in (?)\n";
        params.push(target_years);
      }
      if(!target_sections?.includes("all")){
        query += "AND u.section in (?)\n";
        params.push(target_sections);
      }
      
      const [rows] = await pool.query(query, params)
      const tokens = rows?.map(r => r.fcm_token);

      const batchSize = 200;
      const batches = [];

      for(let b = 0; b < tokens.length; b += batchSize) {
        batches.push(tokens.slice(b, b + batchSize)); 
      }

      const results = await Promise.allSettled(
        batches.map(batch => 
          admin.messaging().sendEachForMulticast({
            tokens: batch,
            ...message
          })
        )
      )

      const staleTokens = [];
      results.forEach((result, batchIndex) => {
        if(result.status === "fulfilled") {
          const currentBatch = batches[batchIndex];
          result.value.responses.forEach((res, idx) => {
            if(!res.success) {
              const errCode = res.error?.code;
              if(errCode === 'messaging/invalid-registration-token' || errCode === 'messaging/registration-token-not-registered') {
                staleTokens.push(currentBatch[idx]);
              }
            }
          }) 
        }
      })

      if(staleTokens.length) {
        await pool.query("delete from fcm_tokens where fcm_token in (?)", [staleTokens]);
        console.log("Deleted " + staleTokens.length + " stale token!");
      }
    }

    resolve({ success: true })
  })
}