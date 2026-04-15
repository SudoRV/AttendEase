import { useEffect, useRef } from "react";
import { AppStates } from "../services/states";

const LeaveBox = () => {

  const applicationRef = useRef(HTMLTextAreaElement);
  const applicable_from_ref = useRef(HTMLInputElement);
  const applicable_to_ref = useRef(HTMLInputElement);

  const { userData, leaveHistory, loadLeaves } = AppStates();

  useEffect(() => {
    // fetch leave
    if (!userData?.email) return;
    loadLeaves(userData?.role);
  }, [userData, loadLeaves])

  async function submitLeave() {
    const application = applicationRef.current.value;
    const from = applicable_from_ref.current.value;
    const to = applicable_to_ref.current.value;

    if (application === "" || !from || !to) {
      alert("Enter leave details");
      return;
    }

    const subject = application?.match(/[Ss]ubject\s*:\s*(.*)\n/)[1];

    // upload to database
    const leave = {
      applicant: userData,
      subject: subject,
      application: application,
      applicable_from: from,
      applicable_to: to
    }

    const response = await fetch("/upload-leave", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(leave)
    })
    const resdata = await response.json();
    alert(resdata.message);
  }

  return (
    <div className="leave-submission">

      {/* Leave History */}
      <div className="leave-box">

        <div className="leave-history-status">
          <div className="leave-history">
            <h2>Leave History</h2>
            <p>
              Leaves this month: <span>{leaveHistory?.length || 0}</span>
            </p>
          </div>

          {/* Leave Status */}
          <div className="leave-status flex flex-col items-end">
            <h2>Leave Status</h2>
            <div className="leave-status flex flex-col items-end">
              <p>
                <span>Sub:</span> {leaveHistory[0]?.subject}
              </p>
              <p>
                <span>From:</span> {new Date(leaveHistory[0]?.applicable_from).toLocaleDateString("en-IN")}
                &nbsp;
                <span>To:</span> {new Date(leaveHistory[0]?.applicable_to).toLocaleDateString("en-IN")}
              </p>
              <p>
                <span>Status:</span> {leaveHistory[0]?.status}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Leave */}
        <div className="submit-leave">
          <h2>Submit Leave</h2>

          <div className="row2">
            <div className="other">
              <label>From</label>
              <input className="select-box" ref={applicable_from_ref} name="applicable_from" type="date" required />
            </div>

            <div className="other">
              <label>To</label>
              <input className="select-box" ref={applicable_to_ref} name="applicable_to" type="date" required />
            </div>
          </div>

          <textarea className="input-box" ref={applicationRef} name="leave_application" placeholder="Type......" rows={4} required></textarea>

          <button
            className="submit-btn"
            onClick={submitLeave}
          >
            Submit
          </button>

        </div>

      </div>

    </div>
  );
};

export default LeaveBox;
