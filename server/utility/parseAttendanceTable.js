const cheerio = require("cheerio");

let report = {};
const parseAttendanceTable = (month, creds, htmlString, newReq) => {
    const $ = cheerio.load(htmlString);
    const attendanceJson = {};
    if (report.student_id !== creds.roll || newReq) {
        report = {};
        report.student_id = creds.roll;
        report.total_classes_held = 0;
        report.total_classes_attended = 0;
        report.attended = 0;
        report.leaves = 0;
    }

    $('tbody tr').each((rowIndex, row) => {
        const cells = $(row).find('td');
        const subject = cells.eq(0).text().trim();

        const total_classes_held = cells.eq(cells.length - 3).text().trim();
        const total_classes_attended = cells.eq(cells.length - 2).text().trim(); const attended = cells.eq(cells.length - 1).text().trim();

        const dayCells = cells.slice(1, -3);
        let totalSubjectLeaves = 0;

        dayCells.map((i, el) => {
            const cellText = $(el).text().trim().toLowerCase();

            // (e.g., "p,l" = 1, "l,l" = 2, "p,a" = 0)
            const leavesInThisCell = (cellText.match(/l/g) || []).length;

            totalSubjectLeaves += leavesInThisCell;
            report.leaves += leavesInThisCell;

            return {
                cellValue: cellText,
                count: leavesInThisCell
            };
        })

        attendanceJson[subject] = {
            total_classes_held,
            total_classes_attended,
            attended,
            leaves: totalSubjectLeaves,

            attendance: dayCells.map((i, el) => $(el).text().trim() || "NA").get()
        };

        report[subject] = report[subject] || {};

        report[subject].total_classes_held = (report[subject].total_classes_held ?? 0) + parseInt(total_classes_held);
        report[subject].total_classes_attended = (report[subject].total_classes_attended ?? 0) + parseInt(total_classes_attended);
        report[subject].attended = ((report[subject].attended ?? 0) + parseInt(attended)) / ((month - creds.startMonth) + 1);

        report.total_classes_held += parseInt(total_classes_held);
        report.total_classes_attended += parseInt(total_classes_attended);
        report.attended = (report.total_classes_attended / report.total_classes_held * 100).toFixed(2);
    })

    return {
        attendance: attendanceJson,
        report
    };
}

module.exports = parseAttendanceTable;