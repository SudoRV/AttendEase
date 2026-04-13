const fs = require("fs");
const path = require("path");
const nodeHtmlToImage = require('node-html-to-image');

async function createTableImage(class_topic, day, classess) {
    const classes = classess.length > 4 ? classess.slice(0, 4) : classess;
    // console.log(classes)

    const timeRow = classes?.map(c => (c.period_id + 8) % 12 + `${c.period_id + 8 >= 12 ? ":00 pm" : ":00 am"}`);
    
    const subjectRow = classes?.map(c => c.subject_name);
    const teacherRow = classes?.map(c => c.teacher_name);

    const htmlTable = `
        <html>
        <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { 
            background-color: transparent !important;
            background: transparent !important;
            margin: 0; 
            padding: 10px;
            font-family: 'Inter', sans-serif;
            }
            .container {
            display: flex;
            gap: 10px;
            justify-content: space-between;
            width: 580px; /* Fixed width for notification safety */
            }
            .class-card {
            flex: 1;
            background: #ffffff;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .time-header {
            background-color: #4F46E5; /* Indigo */
            color: white;
            padding: 8px;
            text-align: center;
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            }
            .content {
            padding: 10px;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 70px;
            }
            .subject {
            color: #111827;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 4px;
            line-height: 1.2;
            }
            .teacher {
            color: #6B7280;
            font-size: 14px;
            font-weight: 400;
            }
        </style>
        </head>
        <body>
        <div class="container">
            ${timeRow?.map((t, i) => `
            <div class="class-card">
                <div class="time-header">${t}</div>
                <div class="content">
                <div class="subject">${subjectRow[i] || 'No Class'}</div>
                <div class="teacher">${teacherRow[i] || ''}</div>
                </div>
            </div>
            `).join('')}
        </div>
        </body>
        </html>
        `;

    // 1. Generate Image
    const imageBuffer = await nodeHtmlToImage({
        html: htmlTable,
        type: 'png',
        transparent: true,
        quality: 90,
        puppeteerArgs: {
            defaultViewport: {
                width: 600,  
                height: 145, 
                isLandscape: true,             
            },
            args: ['--hide-scrollbars', '--disable-web-security']
        }
    });

    const dir = path.join(__dirname, "../static/schedule_images");
    const filename = `schedule_${class_topic}_${day}.png`;
    const filepath = path.join(dir, filename);

    try{
        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filepath, imageBuffer);

        return `/schedule_images/${filename}`;
    } catch (error) {
        console.error("Error saving image:", error);
        throw error;
    }
}

module.exports = createTableImage;
