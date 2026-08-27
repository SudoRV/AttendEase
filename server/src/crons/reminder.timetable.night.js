const pool = require("../config/mysql");
const admin = require("../config/fcm");
const cron = require("node-cron");
const createTableImage = require('../services/createTableImage');
const { clean, buildFcmTopicsFromSchedule } = require("../utils/buildFcmTopics");

const BASE_URL = process.env.API;

// notify for next day timetable
// Night 10:00 pm
const nightTimetableReminder = () => {
    cron.schedule("0 22 * * *", () => {
        const today = new Date();
        const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toLocaleDateString("en-Gb", { weekday: "long" })
        if(day === "Sunday") return;

        console.log("Running task at 10:00 PM every day");
        notifyTimetable(day);
    }, { timezone: "Asia/Kolkata" })
};

async function notifyTimetable(day) {
    const topics = await buildFcmTopicsFromSchedule("target");

    for (const topic of topics) {
        const dayName = day;
        const [classes] = await pool.query("select period_id, subject_id, subject_name, teacher_name, cancelled, substitute_teacher_name from schedule where college_id = ? and course_id = ? and branch_id = ? and year = ? and section = ? and day = ? order by period_id", [topic.college_id, topic.course_id, topic.branch_id, topic.year, topic.section, dayName]);

        let message = "";
        // morning schedule message preperation
        classes.forEach((clas) => {
            message += `${clas.period_id}) ${clas.subject_id} • ${clas.subject_name.length > 26 ? clas.subject_name.slice(0, 23) + "..." : clas.subject_name}\n`
        })

        // create image of timetable
        let scheduleImage = "";
        let scheduleImageUrl = "";

        try {
            // Attempt to generate the image using the headless browser utility
            scheduleImage = classes.length > 0 ? await createTableImage(topic, dayName, classes) : null;

            // If successful and an image path is returned, construct the URL
            if (scheduleImage) {
                scheduleImageUrl = `${BASE_URL}${scheduleImage}?v=${new Date().getTime()}`;
            }
        } catch (browserError) {
            // Gracefully log the error so your server keeps running
            console.error("❌ Headless browser failed to generate schedule image:", browserError.message);

            // Optional: Set a fallback image URL if you have a generic placeholder
            // scheduleImageUrl = `${BASE_URL}/static/images/default-schedule.png`;
        }

        const condition = `'COLLEGE_${topic?.college_id}' in topics && 'COURSE_${clean(topic?.course_id)}' in topics && 'BRANCH_${clean(topic?.branch_id)}' in topics && 'YEAR_${topic?.year}' in topics && 'SECTION_${topic?.section}' in topics`;

        await admin.messaging().send({
            condition,
            data: {
                type: "MORNING_SCHEDULE",
                title: "📚 Morning Classes",
                body: message,
                classes: JSON.stringify(classes),
                schedule_image: scheduleImageUrl,
                scope: `${topic.course_id}_${topic.branch_id}_${topic.year}_${topic.section}`
            },

            android: {
                priority: "high",
            },

            webpush: {
                headers: {
                    Urgency: "high"
                },

                notification: {
                    title: "📚 Today's Classes",
                    body: message,
                    image: scheduleImageUrl,
                    icon: "/icon-512.png",
                },

                fcmOptions: {
                    link: "https://attendease-nivr.onrender.com/"
                }
            }
        });
    }
}

module.exports = {
    nightTimetableReminder,
    notifyTimetable
};
