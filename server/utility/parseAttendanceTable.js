const cheerio = require("cheerio");
const previous_subjects = {
     
};

let report = {};
const parseAttendanceTable = (month, creds, htmlString, newReq) => {
    const $ = cheerio.load(htmlString);
    const attendanceJson = {};
    if(report.student_id !== creds.roll || newReq){
        report = {};
        report.student_id = creds.roll;
        report.total_classes_held = 0;
        report.total_classes_attended = 0;
        report.attended = 0;
    }
    
    $('tbody tr').each((rowIndex, row) => {
        const cells = $(row).find('td');
        const row1 = cells.eq(0).text().trim();
        let subject;
        const recordFound = row1 !== "No Record Found." ? true : false;      
        
        if(!recordFound){
            subject = previous_subjects[rowIndex] || "$";
        } else {
            subject = row1;
            previous_subjects[rowIndex] = row1;
        }

        // ✅ defaults when no record
        let total_classes_held = 0;
        let total_classes_attended = 0;
        let attended = 0;
        let attendance = [];
        let leaves = 0;

        if (recordFound) {
            total_classes_held = parseInt(cells.eq(cells.length - 3).text().trim()) || 0;
            total_classes_attended = parseInt(cells.eq(cells.length - 2).text().trim()) || 0;
            attended = parseInt(cells.eq(cells.length - 1).text().trim()) || 0;

            attendance = cells.slice(1, -3)
                .map((i, el) => $(el).text().trim() || "NA")
                .get();

            leaves = attendance.map(a => ({
                status: a,
                count: a.toLowerCase().trim().split(",").filter(a => a.trim() === "l").length
            })).reduce((prev, current) => {
                return prev + current.count;
            }, 0);
        }

        attendanceJson[subject] = {
            total_classes_held,
            total_classes_attended,
            attended,
            attendance,
            leaves
        };

        report[subject] = report[subject] || {};

        report[subject].total_classes_held = ( report[subject].total_classes_held ?? 0 ) + total_classes_held;

        report[subject].total_classes_attended = ( report[subject].total_classes_attended ?? 0 ) + total_classes_attended;

        report[subject].attended = (( report[subject].attended ?? 0 ) + attended) / ((month - creds.startMonth) + 1);

        report.total_classes_held += total_classes_held;

        report.total_classes_attended += total_classes_attended;

        report.attended = report.total_classes_held
            ? (report.total_classes_attended / report.total_classes_held * 100).toFixed(2)
            : "0.00";

        // ✅ fixed precedence bug
        report.leaves = (report.leaves || 0) + leaves;
    })

    return {
        attendance: attendanceJson,
        report
    };
}

module.exports = parseAttendanceTable;
