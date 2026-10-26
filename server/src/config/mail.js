const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
    },
    connectionTimeout: 30000, // ↑ increase
    greetingTimeout: 30000,
    socketTimeout: 30000,
    family: 4,
});

transporter.verify(function (error, success) {
    if (error) {
        console.log("❌ SMTP Connection Error:");
        console.log(JSON.stringify(error, null, 2));
    } else {
        console.log("✅ Transporter is ready to take our messages");
    }
});

module.exports = transporter;