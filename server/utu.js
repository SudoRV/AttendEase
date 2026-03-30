const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

app.get("/attendance", async (req, res) => {
  try {
    const response = await axios.post(
      "https://online.uktech.ac.in/ums/Student/Public/ShowStudentAttendanceListByRollNoDOB",
      new URLSearchParams({
        CollegeId: 67,
        CourseId: 1,
        BranchId: 1,
        CourseBranchDurationId: 8,
        StudentAdmissionId: 11492,
        DateOfBirth: "08/01/2005",
        SessionYear: 2025,
        RollNo: "221620101047",
        Year: 2026,
        MonthId: 2
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    // send raw HTML table
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Attendance</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f4f6f8;
              padding: 20px;
            }
        
            h1 {
              text-align: center;
              margin-bottom: 20px;
            }
        
            table {
              border-collapse: collapse;
              width: 100%;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
        
            th {
              background: #4f46e5;
              color: white;
              padding: 10px;
              font-size: 14px;
            }
        
            td {
              text-align: center;
              padding: 8px;
              font-size: 13px;
              border: 1px solid gray;
            }
        
            tr:nth-child(even) {
              background: #f9fafb;
            }
        
            tr:hover {
              background: #eef2ff;
            }
        
            /* Attendance Colors */
            td:contains("P") {
              color: green;
              font-weight: bold;
            }
        
            td:contains("A") {
              color: red;
              font-weight: bold;
            }
        
            /* Total columns */
            .clsTCH, .clsTP, .clsPP {
              font-weight: bold;
              background: #e0e7ff;
            }
        
          </style>
        </head>
        
        <body>
          <h1>📊 Attendance Report</h1>
          ${response.data}
        </body>
        </html>
        `);

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Failed to fetch attendance");
  }
});

async function fetchEvents() {
  const response = await axios.post('https://uktech.ac.in/Services/Service.asmx/GetAllEventCalendar', { WebDeptId: 1 }, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });

  console.log(JSON.parse(response.data.d).filter(e => new Date(e.FromDate) >= new Date()))
}

fetchEvents();


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});