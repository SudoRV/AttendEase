const axios = require("axios");

const parseAttendanceTable = require("../utils/parseAttendanceTable");

exports.saveCredentials = async (req, res) => {
    if (!req.headers.creds) res.status(400).json({ success: false, error: "provide credentials !" })
    const creds = JSON.parse(req.headers.creds);
    const attendance = await fetchAttendance(creds);

    // console.log(attendance)
    res.json({ attendance })
}

exports.attendance = async (req, res) => {
    if (!req.headers.creds) res.status(400).json({ success: false, error: "provide credentials !" })
    const creds = JSON.parse(req.headers.creds);
    const attendance = await fetchAttendance(creds);

    // console.log(attendance)
    res.json({ attendance })
}

// fetch attendance data function
async function fetchAttendance(creds) {
    const attendance = {
        attendance: [],
        report: {}
    };

    let newReq = 1;

    for (let i = parseInt(creds.startMonth); i <= new Date().getMonth(); i++) {
        const response = await axios.post(
            "https://online.uktech.ac.in/ums/Student/Public/ShowStudentAttendanceListByRollNoDOB",
            new URLSearchParams({
                CollegeId: creds.collegeId,
                CourseId: creds.courseId,
                BranchId: creds.branchId,
                CourseBranchDurationId: creds.durationId,
                StudentAdmissionId: creds.admissionId,
                DateOfBirth: "",
                SessionYear: "",
                RollNo: creds.roll,
                Year: new Date().getFullYear(),
                MonthId: i + 1
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0"
                }
            }
        );

        console.log(response.data)

        const parsedTable = parseAttendanceTable(i, creds, response.data, newReq);
        if (newReq === 1) newReq = 0;

        attendance.attendance.push({
            month_id: i,
            month: new Date(new Date().getFullYear(), i, 1).toLocaleString("en-Gb", { month: "long" }),
            attendance: parsedTable.attendance,
        })
        attendance.report = parsedTable.report;
    }

    return attendance;
}
