import { useEffect, useRef, useState } from "react";
import { AppStates } from "../services/states";

/**
 * Student Timetable Component
 * Displays a single day's schedule for a student.
 * Accepts props but works with default sample data.
 */

const TimeTable = () => {
  const defaultTimeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
    "04:00 PM", "05:00 PM",
  ];

  const { classes, userData, doFetch, loadTimetable } = AppStates();
  const slots = defaultTimeSlots;
  const editMenuRef = useRef(null);
  const [currentEditCell, setCurrentEditCell] = useState({});
  const [formData, setFormData] = useState({});

  const SubjectEditMenu = (e, period_no) => {
    e.preventDefault();
    setCurrentEditCell({ toglled: true, pos: { x: e.clientY, y: e.clientX }, period_no: period_no });
  }

  const SubjectCell = ({ period_no, code, name, teacher, year, branch, section, room_number, cancelled, current }) => (
    <td className={
      `subject-cell ${current ? "!bg-indigo-400" : ""}`
    } onContextMenu={(e) => SubjectEditMenu(e, period_no)}>
      {
        cancelled ? (
          <div className="cancelled-class">
            <p>Cancelled</p>
          </div>
        ) : (
          ""
        )
      }
      <div className="subject-box">
        {
          code ? (
            <>
              <p className={`subject-code ${current ? "!text-gray-100 !font-light" : ""}`}>{code}</p>
              <p className={`subject-name ${current ? "!text-gray-100 !font-light" : ""}`}>{name}</p>
              <p className={`Teacher-name ${current ? "!text-gray-100 !font-light" : ""}`}>{userData?.role === "Teacher" ? `${branch || ""}-${year || ""}-${section || ""}-${room_number || ""}` : teacher}</p></>
          ) : (
            "Free"
          )
        }
      </div>
    </td>
  );

  useEffect(() => {
    if (currentEditCell.option === "edit") {
      const data = classes?.classes?.[currentEditCell.period_no];

      if (data) {
        setFormData({
          day: data.day || "",
          year: data.year || "",
          branch_id: data.branch_id || "",
          branch_name: data.branch_name || "",
          section: data.section || "",
          room_number: data.room_number || "",
          period_id: data.period_id,
          subject_id: data.subject_id || "",
          subject_name: data.subject_name || ""
        });
      }
    }

    if (currentEditCell.option === "insert") {
      setFormData({
        day: classes.day,
        year: "",
        branch_id: "",
        branch_name: "",
        section: "",
        room_number: "",
        period_id: currentEditCell.period_no || '',
        subject_id: "",
        subject_name: ""
      });
    }
  }, [currentEditCell, classes?.classes, classes?.day]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]:
        e.target.type === "number"
          ? (e.target.value === "" ? "" : parseInt(e.target.value, 10))
          : e.target.value
    }));

  };

  const updateSubject = async (action) => {
    let changes = {};

    if (action === "Update") {
      Object.keys(formData).forEach(key => {

        if (classes.classes[currentEditCell.period_no][key] !== formData[key]) {
          changes[key] = formData[key]
        }
      })

      if (Object.keys(changes).length === 0) {
        console.log("no changes")
        return;
      }
    } else if(action === "Insert") {
      changes = formData
      changes.teacher_id = userData.teacher_id;
      changes.teacher_name = userData.name;
    }

    const data = {
      action: action,
      subject_data: { id: classes?.classes[currentEditCell.period_no].id, changes: changes }
    }

    const response = await doFetch("/update-schedule", "POST", { "Content-Type": "application/json" }, JSON.stringify(data));
    const res_data = await response.data.json();

    if (res_data.success) {
      setCurrentEditCell({});
      loadTimetable(userData)
    }
  }

  return (
    <div className="schedule-container">
      <h2>
        <span className="Day-label">{classes.day}</span>
      </h2>

      <table className="schedule-table">
        <thead>
          <tr>
            {slots.map((time) => (
              <th className="table-time" key={time}>{time}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr>
            {classes?.classes?.map((item, i) => (
              <SubjectCell
                key={i}
                period_no={i}
                code={item.subject_id}
                name={item.subject_name}
                teacher={item.teacher_name}
                year={item.year}
                branch={item.branch_id}
                section={item.section}
                room_number={item.room_number}
                cancelled={item.cancelled}
                current={item.isCurrentPeriod}
              />
            ))}
          </tr>
        </tbody>
      </table>

      {/* popup for rightclick */}
      {
        currentEditCell.toglled === true && (
          <div
            ref={editMenuRef}
            className={
              `min-w-[12rem] absolute flex gap-2 bg-gray-50 shadow-xl p-5 rounded-2xl z-50`
            } style={{
              top: `${currentEditCell.pos.x}px`,
              left: `${currentEditCell.pos.y}px`,
            }}>

            {
              classes?.classes[currentEditCell.period_no]?.subject_id && (
                <div className="flex flex-col ">
                  <button className="rounded-md border-none bg-transparent text-black text-lg text-left"
                    onClick={() => {
                      setCurrentEditCell({
                        period_no: currentEditCell.period_no,
                        option: "edit",
                        toggled: false
                      })
                    }}>Edit Subject</button>

                  <button className="rounded-md border-none bg-transparent text-black text-lg text-left" onClick={() => {
                    setCurrentEditCell({
                      period_no: currentEditCell.period_no,
                      option: "delete",
                      toggled: false
                    })
                  }}>Delete</button>
                </div>
              )
            }

            {
              !classes?.classes[currentEditCell.period_no]?.subject_id && (
                <button className="rounded-md border-none bg-transparent text-black text-lg text-left" onClick={() => {
                  setCurrentEditCell({
                    period_no: currentEditCell.period_no,
                    option: "insert",
                    toggled: false
                  })
                }}>Insert Subject</button>
              )
            }

            <button className="w-6 h-6 flex justify-center items-center text-right bg-transparent text-2xl ml-auto border-none rounded-sm bg-gray-300 hover:bg-red-500 hover:text-white" onClick={() => setCurrentEditCell({})}>×</button>
          </div>
        )
      }

      {/* popup to edit or add subject */}
      {currentEditCell.option && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[28rem] space-y-3">

            <h2 className="text-lg font-semibold capitalize">
              {currentEditCell.option} Subject
            </h2>

            {
              currentEditCell.option === "delete" ? (
                <p className="text-center text-lg">Are you sure to delete ?</p>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    {/* DAY */}
                    <select
                      name="day"
                      value={formData.day}
                      onChange={handleChange}
                      className="input input-box"
                    >
                      <option value="">Select Day</option>
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>

                    {/* PERIOD */}
                    <input
                      name="period_id"
                      placeholder="Period No"
                      value={
                        classes?.classes[currentEditCell.period_no]?.subject_id ? formData.period_id : currentEditCell.period_no
                      }
                      type="number"
                      min={0}
                      max={9}
                      onChange={handleChange}
                      className="input bg-gray-100 input-box"
                    />
                  </div>

                  {/* SUBJECT */}
                  <div className="flex gap-3">
                    <input
                      name="subject_id"
                      placeholder="Subject Code"
                      value={formData.subject_id}
                      autoCapitalize="characters"
                      onChange={handleChange}
                      className="input input-box"
                    />

                    <input
                      name="subject_name"
                      placeholder="Subject Name"
                      value={formData.subject_name}
                      onChange={handleChange}
                      className="input input-box"
                    />
                  </div>

                  <div className="flex gap-3">
                    {/* YEAR */}
                    <input
                      name="year"
                      type="number"
                      placeholder="Year"
                      value={formData.year}
                      min={1}
                      max={4}
                      onChange={handleChange}
                      className="input input-box"
                    />

                    {/* BRANCH */}
                    <input
                      name="branch_id"
                      placeholder="Branch ID"
                      value={formData.branch_id}
                      onChange={handleChange}
                      className="input input-box"
                    />

                    {/* SECTION */}
                    <input
                      name="section"
                      placeholder="Section"
                      value={formData.section}
                      onChange={handleChange}
                      className="input input-box"
                    />

                    {/* ROOM */}
                    <input
                      name="room_number"
                      placeholder="Room Number"
                      type="number"
                      value={formData.room_number}
                      onChange={handleChange}
                      className="input input-box"
                    />
                  </div>

                  <input
                    name="branch_name"
                    placeholder="Branch Name"
                    value={formData.branch_name}
                    onChange={handleChange}
                    className="input input-box"
                  />
                </div>
              )
            }

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setCurrentEditCell({})}
                className="px-4 py-2 rounded-md bg-gray-200 border-none"
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 rounded-md bg-blue-600 text-white border-none"
                onClick={() => updateSubject(currentEditCell.option === "insert" ? "Insert" : currentEditCell.option === "edit" ? "Update" : "Delete")}
              >
                {currentEditCell.option === "insert" ? "Insert" : currentEditCell.option === "edit" ? "Update" : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTable;
