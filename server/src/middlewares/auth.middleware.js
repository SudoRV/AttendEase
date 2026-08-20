const jwt = require("jsonwebtoken");
const pool = require("../config/mysql");
const { messaging } = require("firebase-admin");

const verifySessionToken = async (req, res, next) => {
    let token = null;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else {
        const authHeader = req.headers["authorization"];
        if (authHeader && authHeader.split(" "[1])) {
            token = authHeader.split(" ")[1];
        }
    }

    if(!token) return res.status(401).json({success: false, message: "Unauthorized access!"});

    // decode token 
    const { user_id, email, role, token_version } = jwt.verify(token, process.env.JWT_SECRET);
    
    // check if user exists with the token
    const [rows] = await pool.query("SELECT u.id, u.role, u.name, u.student_id, u.teacher_id, col.university, col.college_id, col.college_name, u.course_id, c.course_name, u.branch_id, b.branch_name, u.year, u.semester, u.section, email, u.password_hash, start_month, collegeId, admissionId, courseId, branchId FROM users u LEFT JOIN courses c ON u.course_id = c.course_id LEFT JOIN colleges col ON u.college_id = col.college_id LEFT JOIN branches b ON u.branch_id = b.branch_id WHERE u.id = ? AND u.email = ? AND role = ?", [user_id, email, role]);
    const user = rows[0];

    delete user?.password_hash;

    if (!user || (user?.token_version || 1) !== token_version) {
        return res.status(401).json({ success: false, message: "Session expired or revoked. Please log in again." });
    }

    req.user = user;
    next();
}

module.exports = verifySessionToken;