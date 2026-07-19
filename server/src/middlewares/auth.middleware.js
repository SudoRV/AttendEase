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
    const [rows] = await pool.query("select user_id, student_id, teacher_id, name, email, password_hash, role, semester, year, start_month, section, collegeId, admissionId, courseId, branchId, branch_id, branch_name, password_hash from users where user_id = ? and email = ?", [user_id, email]);
    const user = rows[0];

    if (!user || (user?.token_version || 1) !== token_version) {
        return res.status(401).json({ success: false, message: "Session expired or revoked. Please log in again." });
    }

    req.user = user;
    next();
}

module.exports = verifySessionToken;