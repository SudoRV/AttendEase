const { raw } = require("mysql2");
const pool = require("../config/mysql");

async function buildFcmTopicsFromSchedule(mode="subscription") {
    return new Promise(async (resolve, reject) => {
        const [raw_topics] = await pool.query(`
            SELECT DISTINCT
                college_id,
                course_id,
                branch_id,
                year,
                section
            FROM schedule
            GROUP BY
                college_id,
                course_id,
                branch_id,
                year,
                section`);

        const topics = new Set();
        for (const raw_topic of raw_topics) {
            const topic_5 = `COLLEGE_${raw_topic.college_id}_${raw_topic.course_id}_${raw_topic.branch_id}_${raw_topic.year}_${raw_topic.section}`;
            const topic_4 = `COLLEGE_${raw_topic.college_id}_${raw_topic.course_id}_${raw_topic.branch_id}_${raw_topic.year}`;
            const topic_3 = `COLLEGE_${raw_topic.college_id}_${raw_topic.course_id}_${raw_topic.branch_id}`;
            const topic_2 = `COLLEGE_${raw_topic.college_id}_${raw_topic.course_id}`;
            const topic_1 = `COLLEGE_${raw_topic.college_id}`;

            if(mode === "subscription") {
                topics.add({topic: clean(topic_1), ...raw_topic});
                topics.add({topic: clean(topic_2), ...raw_topic});
                topics.add({topic: clean(topic_3), ...raw_topic});
                topics.add({topic: clean(topic_4), ...raw_topic});
            }
            topics.add({topic: clean(topic_5), ...raw_topic});
        }

        // console.log(Array.from(topics));
        resolve(Array.from(topics));
    })
}




async function buildFcmTopicsByTarget(
    target_college,
    target_courses,
    target_branches,
    target_years,
    target_sections,
    scope,
    mode="subscription" //target
) {
    const conditions = [];
    const params = [];

    // Always filter by college
    conditions.push("college_id = ?");
    params.push(target_college);

    // Add optional filters dynamically
    if (!target_courses.includes("all")) {
        conditions.push("course_id IN (?)");
        params.push(target_courses);
    }
    if (!target_branches.includes("all")) {
        conditions.push("branch_id IN (?)");
        params.push(target_branches);
    }
    if (!target_years.includes("all")) {
        conditions.push("year IN (?)");
        params.push(target_years);
    }
    if (!target_sections.includes("all")) {
        conditions.push("section IN (?)");
        params.push(target_sections);
    }

    const query = `
        SELECT DISTINCT
            course_id,
            branch_id,
            year,
            section
        FROM schedule
        WHERE ${conditions.join(" AND ")}
    `;

    const [raw_topics] = await pool.query(query, params);
    const topics = raw_topics.map(rt => `COLLEGE_${target_college}_${clean(rt.course_id)}_${clean(rt.branch_id)}_${rt.year}_${rt.section}`);

    if(scope === "students" && mode === "subscription") return topics.flatMap(topic => {
        let replacee = ""
        const new_topics = topic.split("_").slice(2).toReversed().map(t => {
            replacee = `_${t}` + replacee;
            const nt = topic.replace(replacee, "");

            if(nt.split("_").length > 1) {
                return nt;
            }
        });

        return [topic, ...new_topics];
    })
    else if(scope === "students" && mode === "target") return topics;

    else if(scope === "teachers") return ["TEACHERS"];
}



// Helper function to sanitize parameters for FCM topic naming rules ([a-zA-Z0-9-_~%])
function clean(str) {
    if (!str) return "";
    return String(str).replace(/[^a-zA-Z0-9-_~%]/g, "");
}




module.exports = {
    buildFcmTopicsFromSchedule,
    buildFcmTopicsByTarget,
    clean
}