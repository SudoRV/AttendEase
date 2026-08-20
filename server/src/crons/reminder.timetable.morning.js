const pool = require("../config/mysql");
const admin = require("../config/fcm");
const cron = require("node-cron");
const createTableImage = require('../services/createTableImage');
const { buildFcmTopicsFromSchedule } = require("../utils/buildFcmTopics");

const BASE_URL = process.env.API;

// notify for next day timetable
// Morning 08:00 am
const morningTimetableReminder = () => {
    cron.schedule("2 16 * * *", () => {
        console.log("Running task at 08:00 AM every day");
        notifyTimetable(new Date().toLocaleDateString("en-Gb", { weekday: "long" }));
    }, { timezone: "Asia/Kolkata" })
};

module.exports = morningTimetableReminder;

async function notifyTimetable(day) {
    const topics = await buildFcmTopicsFromSchedule("target");
    
    for (const topic of topics) {
        // send timetable notification
        const dayName = day;

        const [classes] = await pool.query("select s.period_id, s.subject_id, s.subject_name, u.teacher_name, s.cancelled, s.substitute_teacher_name from schedule where college_id = ? and course_id = ? and branch_id = ? and year = ? and section = ? and day = ? order by period_id", [topic.college_id, topic.course_id, topic.branch_id, topic.year, topic.section, dayName]);

        let message = "";

        classes.forEach((clas) => {
            message += `${clas.period_id}) ${clas.subject_id} • ${clas.subject_name.length > 26 ? clas.subject_name.slice(0, 23) + "..." : clas.subject_name}\n`
        })

        // create image of timetable
        // Initialize variables with fallback values outside the block
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

        if (classes.length > 0) {
            await admin.messaging().send({
                topic: topic.topic,
                data: {
                    type: "MORNING_SCHEDULE",
                    title: "📚 Today's Classes",
                    body: message,
                    classes: JSON.stringify(classes),
                    schedule_image: scheduleImageUrl,
                    scope: topic.topic
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
}
