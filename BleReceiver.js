let announcement = {
    init: false,
    notification_id: null,
    title: null,
    body: null
};

function processNotification(companyIdHex, uuid, major, minor) {
  let title, body;

  const companyId = 0xFFFF;
  const appid = "41545445"; // ATTE

  console.log("Checking packet:", appid, uuid, major, minor)

  const receivedCompanyId = parseInt(companyIdHex, 16);

  // 1. SAFETY CHECK: Ignore packets that don't match your custom 0xFFFF Company ID
  if (receivedCompanyId !== companyId) {
    return;
  }

  // SAFETY CHECK: Ignore all Bluetooth packets that don't belong to your app
  if (!uuid.toUpperCase().startsWith(appid)) {
    return;
  }

  console.log("Valid App Packet Received!");
  console.log(`UUID: ${uuid} | Major: ${major} | Minor: ${minor}`);

  // Break the UUID back down into its original blocks
  const blocks = uuid.split('-');
  const chunk1 = blocks[1]; // 4 chars
  const chunk2 = blocks[2]; // 4 chars
  const chunk3 = blocks[3]; // 4 chars

  const finalBlock = blocks[4];
  const notification_id = finalBlock.substring(0, 8);
  const notification_completed = finalBlock[11];
  // const typeFlag = finalBlock.substring(8, 10); // e.g., 1684, 0184, 0284

  // check if notification already received 
  const olderNotification = database.execute("select * from notifications where notification_id = ?", [notification_id]).rows._array[0];

  if (!!olderNotification) return;

  // ----------------------------------------------------
  // YOUR CORE LOGIC HERE
  // ----------------------------------------------------
  // Example: Check typeFlag to know if this is Title data, Body data, or Class Cancellation
  // Example: Convert major/minor and chunk1/2/3 hex back into your 10-character string

  const notificationType = chunk1[0];
  const notificationScope = chunk1.slice(1, 3);
  const scopeBranch = notificationScope[0];
  const scopeYear = notificationScope[1];
  const scopeSection = notificationScope[2];
  const announcementScope = notificationType === 2 ? unpackMetadata(chunk1 + chunk2) : null;

  // class cancellation
  if (notificationType === 0) {
    const leave_type = finalBlock[10];
    const periods = decodePeriods(chunk2);
    const toDiff = hexToDec(chunk3);
    const from = new Date().toLocaleDateString();
    const to = leave_type === 2 ? new Date(new Date() + toDiff * 24 * 60 * 60 * 1000) : new Date();
    const teacherName = database.execute("select teacher_name from timetable where day = ? and period_id = ?", [new Date().toLocaleDateString("en-Gb", { weekday: "long" }), periods[0]]).rows._array[0];

    const message = `Period ${periods
      .map((p) => p.period_id)
      .join(", ")} of ${teacherName} cancelled, on leave ${new Date(from).toDateString() === to.toDateString()
        ? `for ${new Date(from).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`
        : `from ${new Date(from).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })} to ${new Date(to).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`
      }`

      title = "Class Cancellation";
      body = message;
  }

  // class substitution
  else if (notificationType === 1) {
    const substitutee = chunk2;
    const substitutionStatus = substitutee[2];
    const substituteeDetails = database.execute("select teacher_name, subject_name from timetable where day = ? and period_id = ?", [new Date().toLocaleString("en-Gb", { weekday: "long" }), substitutee[3]]).rows._array[0];

    const substitutor = chunk3;
    const substitutorDay = scopes("day", substitutor[2]);
    const substitutorPeriod = chunk3[3];
    const substitutorDetails = database.execute("select teacher_name from timetable where day ? and period_id = ?", [substitutorDay, substitutorPeriod]).rows._array[0];

    const message = !!substitutionStatus ? `Class ${substituteeDetails.subject_name} of ${substituteeDetails.teacher_name} is substituted by ${substitutorDetails.teacher_name}` : `Substitution of class ${substituteeDetails.subject_name} cancelled by ${substitutorDetails.teacher_name}`;

    title = "Class Substitution";
    body = message;
  }

  else if (notificationType === 1) {
    const dataType = finalBlock[10];

    // first block received with notification id
    if (!!announcement.init === false && dataType === 0) {
      announcement.init = true;
      announcement.notification_id = notification_id;
    }

    // other blocks with title and body
    else if (announcement.init === true && (dataType === 1 || dataType === 2) && announcement.notification_id === notification_id) {
      // 1. Recombine all the hex chunks just like they were before splitting
      const hexChunk = chunk1 + chunk2 + chunk3 + major + minor;

      // 2. Convert the hex string back to readable text characters
      let decodedString = "";
      for (let i = 0; i < hexChunk.length; i += 2) {
        // Grab two hex characters (one byte)
        const hexByte = hexChunk.substring(i, i + 2);

        // If we hit the padding zeros, stop decoding so we don't get null characters
        if (hexByte === "00") {
          break;
        }

        // Convert hex to decimal, then to the character
        const charCode = parseInt(hexByte, 16);
        decodedString += String.fromCharCode(charCode);
      }

      // 3. Append the clean, decoded string to your title
      if(dataType === 1){
        announcement.title += decodedString;
      } else {
        announcement.body += decodedString;
      }
    };

    if (announcement.init === true && announcement.notification_id === notification_id && notification_completed) {
      title = announcement.title;
      body = announcement.body;

      announcement = {
        init: false,
        notification_id: null,
        title: null,
        body: null
      }
    }
  }

  // display and propagate received notification + save it in local database
  print(title, body)
}


processNotification("0xFFFF" ,"41545445-4090-0002-AC84-6ECB41DEB000", "1280", "51210")

