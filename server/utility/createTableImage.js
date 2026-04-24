const fs = require("fs");
const path = require("path");
const nodeHtmlToImage = require('node-html-to-image');

async function createTableImage(class_topic, day, classess) {
    const classes = classess.length > 4 ? classess.slice(0, 4) : classess;

    const timeRow = classes?.map(c => (c.period_id + 8) % 12 + `${c.period_id + 8 >= 12 ? ":00 pm" : ":00 am"}`);

    const subjectRow = classes?.map(c => c.subject_name);
    const teacherRow = classes?.map(c => c.substitute_teacher_name || c.teacher_name);

    const htmlTable = `
        <html>
        <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            
            * {
                box-sizing: border-box;
            }
            
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
                justify-content: flex-start;
                width: 580px;
                padding-bottom: 25px; /* Keeps the badges from being cut off */
            }
            
            .class-card {
                flex: 1 1 0; 
                width: 0; /* Forces flex-basis to be the absolute source of truth */
                background: #ffffff;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                margin-bottom: 10px;
                position: relative;
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
            flex:1;
            padding: 16px 10;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 70px;
            }
            .subject {
            color: #111827;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 4px;
            line-height: 1.2;

            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow-x: hidden;
            }
            .teacher {
            color: #6B7280;
            font-size: 14px;
            font-weight: 400;
            margin-bottom: 8px;

            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow-x: hidden;
            }

            .cancelled, .substituted {
                position: absolute;
                bottom: -12px;
                left: 50%;
                transform: translateX(-50%);
                color: white;
                border-radius: 100px;
                padding: 4px 12px; /* Slightly tighter padding */
                font-size: 14px;
                font-weight: 700;
                white-space: nowrap; /* Prevents text from pushing width */
                
                /* Fixed Shadow Syntax */
                box-shadow: 0 2px 6px rgba(0,0,0,0.3); 
                
                z-index: 10;
            }

            .cancelled{
                background-color: red;
                font-weight: 600;
            }

            .substituted{
                background-color: teal;
                font-weight: 600;
            }
        </style>
        </head>
        <body>
        <div class="container">
            ${timeRow?.map((t, i) => {
                // Inside the map function
                const status = !!classes[i]?.substitute_teacher_name ? "Substituted" : (classes[i]?.cancelled ? "Cancelled" : null);
                const statusClass = !!classes[i]?.substitute_teacher_name ? "substituted" : (classes[i]?.cancelled ? "cancelled" : "");;

                return `
        <div class="class-card">
            <div class="time-header">${t}</div>
            <div class="content">
                <div class="subject">${subjectRow[i] || 'No Class'}</div>
                <div class="teacher">${teacherRow[i] || ''}</div>
            </div>
            ${status ? `<div class="${statusClass}">${status}</div>` : ''}
        </div>
        `;
            }).join('')}
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

    try {
        if (!fs.existsSync(dir)) {
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
