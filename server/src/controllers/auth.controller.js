const pool = require("../config/mysql");
const admin = require("../config/fcm");
const transporter = require("../config/mail");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { buildFcmTopicsByTarget2 } = require("../utils/buildFcmTopics");

// register
exports.register = async (req, res) => {
    const { role, name, email, password, student_id, teacher_id, college_id, course_id, branch_id, year, semester, section } = req.body;

    if (!email || !password) {
        res.json({ success: false, message: "Credentials required" })
    }

    const response = await validateCreds({
        email,
        [student_id === "" ? "teacher_id" : "student_id"]: student_id === "" ? teacher_id : student_id
    })

    if (response.success == false) {
        // convert password to password hash
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        try {
            const [result] = await pool.query(
                `INSERT INTO users (role, name, email, password_hash, student_id, teacher_id, college_id, course_id, branch_id, year, semester, section)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [role, name, email, password_hash, student_id, teacher_id, college_id, course_id, branch_id, year, semester, section]
            );

            if (result.insertId) {
                // console.log("User registered successfully # :", result);
                res.json({ success: true, message: "Registered Successfully" });
            }
        } catch (error) {
            console.error("Error inserting user:", error);
            res.json({ success: false, message: "Error registering user" });
        }

    } else {
        res.json({ success: false, message: "Already Registered" })
    }
}

// verify creds
exports.validateCreds = async (req, res) => {
    try {
        const result = await validateCreds(req.body);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
}

// login
exports.login = async (req, res) => {
    const { email, password, clientType = "web" } = req.body;

    // basic validation
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password required" });
    }

    // authentication from database / get password hash from databse
    const [rows] = await pool.query("SELECT u.id, u.role, u.name, u.student_id, u.teacher_id, col.university, col.id as college_id, col.college_name, u.course_id, c.course_name, u.branch_id, b.branch_name, u.year, u.semester, u.section, u.email, u.password_hash, start_month, collegeId, admissionId, courseId, branchId FROM users u LEFT JOIN courses c ON u.course_id = c.course_id LEFT JOIN colleges col ON u.college_id = col.id LEFT JOIN branches b ON u.branch_id = b.branch_id WHERE u.email = ?", [email]);
    const user = rows[0];

    if (!user.email) {
        res.json({ success: false, message: "user not found" });
        return;
    }

    // compare the password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    // Mask password hash
    delete user.password_hash;

    // generate jwt
    const token = jwt.sign({
        user_id: user.id,
        email: user.email,
        role: user.role,
        token_version: user.token_version || 1
    }, process.env.JWT_SECRET);

    if (isMatch) {
        if (clientType === "web") {
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: "lax",
                maxAge: 10 * 365 * 24 * 60 * 60 * 1000 // 10 years
            })
            return res.json({ success: true, message: "user authenticated and authorised", user_creds: user });
        }

        res.json({ success: true, message: "user authenticated and authorised", token, user_creds: user });
    } else {
        res.json({ success: false, message: "Incorrect password", });
    }
}

// logout
exports.logout = async (req, res) => {
    const user = req.user;
    const { token: fcmToken } = req.body;

    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0)
    });

    // unsubscribe topics
    const topics = await buildFcmTopicsByTarget2(user.college_id, [user.course_id], [user.branch_id], [user.year], [user.section], user.role === "Student" ? "students" : "teachers");

    for (const topic of topics) {
        try {
            await admin.messaging().unsubscribeFromTopic([fcmToken], topic);
        } catch (error) {
            return res.status(200).json({ success: false, message: error?.message || "Internal Server Error." });
        }
    }

    // delete the token
    const loggedOut = await pool.query("delete from fcm_tokens where user_id = ? and fcm_token = ?", [user.id, fcmToken]);

    return res.status(200).json({ success: true, message: 'Logged out successfully' });
}

// me
exports.me = async (req, res) => {
    const user = req.user;

    if (user) return res.json({ success: true, message: "User authenticated and authorized.", user });
}

// change password 
exports.changePassword = async (req, res) => {
    const user = req.user;
    const email = user.email;
    const { old_password, new_password } = req.body;

    if (!user || !email) {
        return res.status(400).json({ success: false, message: "User doesn't exists" });
    }

    const isMatch = await bcrypt.compare(old_password, user.password_hash);
    if (!isMatch) return res.json({ success: false, message: "Password not matched" });

    const new_password_hash = await bcrypt.hash(new_password, 10);

    // update the databse
    const response = await pool.query("update users set password_hash = ? where email = ?", [new_password_hash, email]);

    if (response.affectedRows > 0) return res.json({ success: true, message: "Password changed successfully" });

    res.json({ success: false, message: "Internal server error" });
}

// ask otp to reset password
exports.requestOtp = async (req, res) => {
    const { email } = req.body;
    const [user] = await pool.query("select email from users where email = ?", [email]);

    if (!user.email) {
        return res.json({ success: false, message: "User doesn't exists!" });
    }

    const otpCode = generateOTP();
    const otpData = {
        code: otpCode,
        request_time: Date.now(),
        ttl: 15,
    };

    try {
        const [result] = await pool.query("UPDATE users SET otp = ? WHERE email = ?", [
            JSON.stringify(otpData),
            email
        ]);

        if (result.affectedRows <= 0) {
            return res.json({ success: false, message: "User record not found in database" });
        }

        const mailOptions = {
            from: '"AttendEase Support" <help.sudorv@gmail.com>',
            to: email,
            subject: `${otpData.code} is your AttendEase reset code`,
            html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 0; width: 100%;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">AttendEase</h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 0 20px 40px 20px; text-align: center;">
                  <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 16px;">Reset Your Password</h2>
                  <p style="color: #64748b; font-size: 16px; line-height: 24px; margin-bottom: 32px;">
                    We received a request to reset your password. Use the code below to proceed. This code will expire in 10 minutes.
                  </p>
                  
                  <div style="background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: bold; color: #4f46e5; letter-spacing: 8px;">
                      ${otpData.code}
                    </span>
                  </div>
    
                  <p style="font-size: 16px;">This OTP is valid only for ${otpData.ttl} min.</p>
                  
                  <p style="color: #94a3b8; font-size: 14px; line-height: 20px;">
                    If you didn't request this, you can safely ignore this email. Your password won't change until you use this code to create a new one.
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 30px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    &copy; 2026 AttendEase. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </div>
        `
        };

        // 2. Use the Promise version of sendMail. 
        // This prevents the "Hanging/Bad Gateway" issue on Render.
        await transporter.sendMail(mailOptions);

        // 3. Success response only after email is truly sent
        return res.json({
            success: true,
            message: "OTP sent successfully. Check your email."
        });

    } catch (error) {
        console.error("🔥 ERROR:", error);

        // This ensures that even if SMTP times out, you return JSON, not a 502 HTML page
        return res.status(500).json({
            success: false,
            message: "Mail server timeout.",
            error: error.message
        });
    }
}

// verify otp and reset password
exports.resetPassword = async (req, res) => {
    const { email, new_password, otp: userOtp } = req.body;
    const [user] = await pool.query("select otp from users where email = ?", [email]);

    const otp = user[0].otp;

    if (!otp.code || new Date(otp.request_time).getTime() + otp.ttl * 60 * 1000 < new Date().getTime() || otp.code !== userOtp) {
        return res.status(400).json({ success: false, message: "OTP incorrect or expired" });
    }

    // reset password
    const new_password_hash = await bcrypt.hash(new_password, 10);

    // update the databse
    const response = await pool.query("update users set password_hash = ? where email = ?", [new_password_hash, email]);

    if (response.affectedRows > 0) return res.json({ success: true, message: "Password reset successfully" });

    res.json({ success: false, message: "Internal server error" });
}




// helpers will be moved to utils

function generateUserId({ role, name, email, student_id, teacher_id }) {
    const input = `${role}|${name}|${email}|${student_id || ''}|${teacher_id || ''}`;

    const hash = crypto
        .createHash('sha256')
        .update(input)
        .digest('base64')       // compact encoding
        .replace(/[^a-zA-Z0-9]/g, '') // remove symbols
        .slice(0, 16);          // take first 12 chars

    return hash;
}


const validateCreds = async (data) => {
    if (!data || Object.keys(data).length === 0) {
        return { success: false, message: "no fields provided" };
    }

    const fields = Object.keys(data);
    const values = Object.values(data);
    const whereClause = fields.map(f => `${f} = ?`).join(" AND ");

    const [rows] = await pool.query(
        `SELECT * FROM users WHERE ${whereClause} LIMIT 1`,
        values
    );

    if (rows.length > 0) {
        return { success: true, message: "credentials found" };
    }

    return { success: false, message: "credentials not found" };
};


function generateOTP() {
    const otp = crypto.randomInt(100000, 1000000);
    return otp.toString();
}