const pool = require("../config/mysql");
const admin = require("../config/fcm");
const cron = require("node-cron");
const createTableImage = require('../services/createTableImage');
const { buildFcmTopicsFromSchedule, buildFcmTopicsByTarget } = require("../utils/buildFcmTopics");

const BASE_URL = process.env.API;

// notify for next day timetable
// Night 10:00 pm
const nightTimetableReminder = () => {
    cron.schedule("0 22 * * *", () => {
        console.log("Running task at 10:00 PM every day");
        notifyTimetable(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1).toLocaleDateString("en-Gb", { weekday: "long" }));
    }, { timezone: "Asia/Kolkata" })
};

module.exports = nightTimetableReminder;

async function notifyTimetable(day) {
    const topics = await buildFcmTopicsFromSchedule("target");
    
    for (const topic of topics) {
        // send timetable notification
        const dayName = day;

        const [classes] = await pool.query("select period_id, subject_id, subject_name, teacher_name, cancelled, substitute_teacher_name from schedule where college_id = ? and course_id = ? and branch_id = ? and year = ? and section = ? and day = ? order by period_id", [topic.college_id, topic.course_id, topic.branch_id, topic.year, topic.section, dayName]);

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
                    title: "📚 Morning Classes",
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
