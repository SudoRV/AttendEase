import { useEffect, useRef, useState } from "react";
import { AppStates } from "../services/states";
import { FiCalendar, FiRotateCw } from "react-icons/fi";
import { IoRestaurantOutline } from 'react-icons/io5';
import DaySelector from "./ui/DaySelector";
import { Fetch } from "../services/api";

/**
 * Student/Teacher Timetable Component
 * Displays a single day's schedule.
 */
const TimeTable = () => {
  const defaultTimeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
    "04:00 PM", "05:00 PM",
  ];

  const { classes, userData, loadTimetable, teacherLeaveHistory, buildUrl } = AppStates();
  const slots = defaultTimeSlots;
  const editMenuRef = useRef(null);
  const longPressTimer = useRef(null);

  // Modal & Content Management States
  const [currentEditCell, setCurrentEditCell] = useState({});
  const [formData, setFormData] = useState({});
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [teacherLeaves, setTeacherLeaves] = useState([]);

  // Handles Context Menu Positioning (Unified for Right-Click or Long-Press trigger)
  const openContextActions = (clientX, clientY, period_no, item) => {
    setCurrentEditCell({
      toggled: true,
      pos: { x: clientY, y: clientX },
      period_no: period_no,
      item: item
    });
  };

  const handleContextMenu = (e, period_no, item) => {
    e.preventDefault();
    openContextActions(e.clientX, e.clientY, period_no, item);
  };

  // Mobile Web Touch Handlers to simulate real Long Press
  const handleTouchStart = (e, period_no, item) => {
    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;

    longPressTimer.current = setTimeout(() => {
      openContextActions(clientX, clientY, period_no, item);
    }, 500); // 500ms delay threshold
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  // Dispatches context selection options
  const handleMenuOptionClick = (option) => {
    if (option === "leaves") {
      const targetTeacherId = currentEditCell.item?.teacher_id;
      if (!targetTeacherId) {
        setTeacherLeaves([]);
      } else {
        const leaves = teacherLeaveHistory?.filter(
          leave => leave.teacher_id === targetTeacherId
        );
        setTeacherLeaves(leaves || []);
      }
      setLeaveModalVisible(true);
      setCurrentEditCell({}); // Close context popup menu
    } else {
      setCurrentEditCell(prev => ({
        ...prev,
        option: option,
        toggled: false
      }));
    }
  };

  // Click Outside Listener to Close Context Menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editMenuRef.current && !editMenuRef.current.contains(event.target)) {
        setCurrentEditCell({});
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const SubjectCell = ({ item, period_no, code, name, teacher, year, branch, section, room_number, cancelled, current }) => {
    const cellBackground = !code
      ? "bg-gradient-to-br from-neutral-200 dark:from-neutral-900 to-neutral-50 dark:to-neutral-700 dark:shadow-none"
      : item?.is_cancelled
        ? "bg-white dark:bg-slate-900 border-2 border-dashed border-neutral-200"
        : item?.subject_name === "LUNCH"
          ? "!p-0 dark:shadow-none"
          : current
            ? "animate-current !bg-indigo-500"
            : "bg-gradient-to-br from-indigo-600 to-indigo-400 dark:shadow-none";

    const cellRef = useRef(null);

    return (
      <td
        ref={cellRef}
        className={`subject-cell ${cellBackground} relative cursor-pointer select-none`}
        onContextMenu={(e) => handleContextMenu(e, period_no, item)}
        onTouchStart={(e) => handleTouchStart(e, period_no, item)}
        onTouchEnd={handleTouchEnd}
      >
        {
          code ? item.subject_name === "LUNCH" ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2.5 py-5 px-6 bg-neutral-50 dark:bg-neutral-950/40 rounded-xl border border-neutral-200/60 dark:border-neutral-900">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-500/10 text-teal-500 dark:text-teal-400 rounded-xl shadow-sm">
                <IoRestaurantOutline size={30} />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-100">
                Lunch Break
              </span>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col justify-between">
              <p className={`subject-code ${current ? "!text-gray-100 !font-light" : ""} ${item?.cancelled ? "text-red-500" : "text-neutral-50"}`}>{code}</p>
              <p className={`subject-name ${current ? "!text-gray-100 !font-light" : ""}`}>{name}</p>
              <p className={`Teacher-name text-ellipsis !line-clamp-1 ${current ? "!text-gray-100 !font-light" : ""} ${item?.subject_name === "LUNCH" ? "!border-none !text-yellow-400" : ""}`}>
                {userData?.role === "Teacher" ? `${branch || ""}-${year || ""}-${section || ""}-${room_number || ""}` : item?.substitute_teacher_name || teacher}
              </p>
            </div>
          ) : (
            <p className="!text-black dark:!text-neutral-300 !text-lg !font-bold">Free</p>
          )
        }
        {
          cancelled ? (
            <div className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full z-10 ${item?.substitute_teacher_id ? "bg-teal-500" : "bg-red-500"}`}>
              <p className="text-white text-xs">
                {item?.substitute_teacher_id ? "Substituted" : "Cancelled"}
              </p>
            </div>
          ) : ""
        }
      </td>
    );
  };

  // Form Population Lifecycle Hooks
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
          period_id: data.period_id !== undefined ? data.period_id : currentEditCell.period_no,
          subject_id: data.subject_id || "",
          subject_name: data.subject_name || "",
          semester: data.semester || ""
        });
      }
    }

    if (currentEditCell.option === "insert") {
      setFormData({
        day: classes.day || "",
        year: "",
        branch_id: "",
        branch_name: "",
        section: "",
        room_number: "",
        period_id: currentEditCell.period_no,
        subject_id: "",
        subject_name: "",
        semester: ""
      });
    }
  }, [currentEditCell.option, currentEditCell.period_no, classes?.classes, classes?.day]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.type === "number"
        ? (e.target.value === "" ? "" : parseInt(e.target.value, 10))
        : e.target.value
    }));
  };

  const updateSubject = async (action) => {
    let changes = {};

    if (action === "Update") {
      Object.keys(formData).forEach(key => {
        if (classes.classes[currentEditCell.period_no][key] !== formData[key]) {
          changes[key] = formData[key];
        }
      });
      if (Object.keys(changes).length === 0) {
        setCurrentEditCell({});
        return;
      }
    } else if (action === "Insert") {
      changes = { ...formData };
      changes.teacher_id = userData?.teacher_id || "";
      changes.teacher_name = userData?.name || "";
    }

    const data = {
      action: action,
      subject_data: { id: classes?.classes[currentEditCell.period_no]?.id, changes: changes }
    };

    try {
      const response = await Fetch("/api/timetable/class", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const res_data = await response.json();

      if (res_data.success) {
        setCurrentEditCell({});
        await loadSpecificTimetable();
      }
    } catch (err) {
      console.error("Failed handling database update transaction:", err);
    }
  };

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTimetable, setSelectedTimetable] = useState({});
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  async function loadSpecificTimetable() {
    setLoadingTimetable(true);
    const timetable = await loadTimetable(userData, selectedDay);
    setSelectedTimetable(timetable || {});
    setLoadingTimetable(false);
  }

  useEffect(() => {
    if (!selectedDay) return;
    loadSpecificTimetable();
  }, [selectedDay]);

  async function refreshTimetable() {
    if (classes.day !== selectedDay) {
      setSelectedDay(classes.day);
    } else {
      setLoadingTimetable(true);
      await loadTimetable(userData);
      setLoadingTimetable(false);
    }
  }

  const activeClassesSource = (selectedTimetable?.day ? selectedTimetable : classes)?.classes || [];

  return (
    <div className="schedule-container !overflow-y-visible">
      <div className="flex flex-row items-center gap-3 border-2 mt-2">
        <FiCalendar size={34} />
        <DaySelector selectedDay={selectedDay} setSelectedDay={setSelectedDay} classes={classes} />
        <button onClick={refreshTimetable} className="border-none bg-transparent cursor-pointer mt-0.5">
          <FiRotateCw className={`${loadingTimetable ? "animate-spin" : ""}`} size={22} />
        </button>
      </div>

      <div className="schedule-classes custom-scrollbar !overflow-y-hidden">
        <table className="!w-full schedule-table">
          <thead>
            <tr>
              {slots.map((time) => (
                <th className="table-time !bg-neutral-900/80 dark:!bg-neutral-700/40 !text-neutral-50 dark:!text-neutral-300" key={time}>{time}</th>
              ))}
            </tr>
          </thead>
          <tbody className="flex-1">
            <tr className="h-full">
              {activeClassesSource.map((item, i) => (
                <SubjectCell
                  key={i}
                  item={item}
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

        {/* POPUP ACTION CONTEXT MENU */}
        {currentEditCell.toggled === true && (
          <div
            ref={editMenuRef}
            className="min-w-[12rem] absolute flex flex-col bg-white dark:bg-neutral-900/90 shadow-xl border border-neutral-200 p-3 rounded-xl z-50"
            style={{ top: `${currentEditCell.pos.x}px`, left: `${currentEditCell.pos.y}px` }}
          >
            {activeClassesSource[currentEditCell.period_no]?.subject_id ? (
              <>
                <button className="rounded-md border-none bg-transparent hover:bg-slate-100 dark:hover:text-neutral-700 text-black dark:text-neutral-100 p-2 text-sm text-left font-medium cursor-pointer"
                  onClick={() => handleMenuOptionClick("edit")}>Edit Subject</button>
                <button className="rounded-md border-none bg-transparent hover:bg-red-50 text-red-600 p-2 text-sm text-left font-medium cursor-pointer"
                  onClick={() => handleMenuOptionClick("delete")}>Delete</button>
              </>
            ) : (
              <button className="rounded-md border-none bg-transparent hover:bg-slate-100 text-black p-2 text-sm text-left font-medium cursor-pointer"
                onClick={() => handleMenuOptionClick("insert")}>Insert Subject</button>
            )}

            {/* CONDITIONAL RENDER RULE: ONLY VISIBLE IFF ROLE IS TEACHER */}
            {userData?.role === "Student" && (
              <button className="rounded-md border-none bg-transparent hover:bg-indigo-50 text-indigo-600 border-t border-neutral-100 pt-2 p-2 text-sm text-left font-medium cursor-pointer"
                onClick={() => handleMenuOptionClick("leaves")}>View Teacher Leaves</button>
            )}

            <button className="w-full text-center bg-slate-100 dark:bg-neutral-800 text-sm py-1.5 mt-2 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-900 border-none cursor-pointer" onClick={() => setCurrentEditCell({})}>Close</button>
          </div>
        )}

        {/* MODAL WINDOW FOR CRUD OPERATIONS */}
        {currentEditCell.option && (
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex justify-center items-center z-50 transition-colors">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-[28rem] space-y-4 shadow-2xl transition-all border border-transparent dark:border-neutral-800">

              {/* Modal Header */}
              <h2 className="text-lg font-semibold capitalize text-slate-800 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                {currentEditCell.option} Subject
              </h2>

              {currentEditCell.option === "delete" ? (
                <p className="text-center text-lg text-slate-600 dark:text-neutral-400 py-4">
                  Are you sure you want to delete this period layout?
                </p>
              ) : (
                <div className="flex flex-col gap-3">

                  {/* Day & Period No */}
                  <div className="flex gap-3">
                    <div className="flex-1 flex flex-col">
                      <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">Day</label>
                      <input
                        name="day"
                        value={formData.day}
                        onChange={handleChange}
                        className="input input-box border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-2 rounded-lg text-sm text-slate-800 dark:text-neutral-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                      />
                    </div>
                    <div className="w-[100px] flex flex-col">
                      <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">Period No</label>
                      <input
                        type="number"
                        name="period_id"
                        value={formData.period_id}
                        onChange={handleChange}
                        className="input input-box border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-2 rounded-lg text-sm text-center text-slate-800 dark:text-neutral-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Subject Code & Subject Name */}
                  <div className="flex gap-3">
                    <div className="flex-1 flex flex-col">
                      <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">Subject Code</label>
                      <input
                        name="subject_id"
                        value={formData.subject_id}
                        onChange={handleChange}
                        placeholder="e.g. CS-401"
                        className="input input-box border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-2 rounded-lg text-sm uppercase text-slate-800 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">Subject Name</label>
                      <input
                        name="subject_name"
                        value={formData.subject_name}
                        onChange={handleChange}
                        placeholder="e.g. Mathematics"
                        className="input input-box border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-2 rounded-lg text-sm text-slate-800 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Year, Semester, & Section */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">Year</label>
                      <input
                        type="number"
                        name="year"
                        value={formData.year}
                        min={1}
                        max={5}
                        onChange={handleChange}
                        className="input input-box border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-2 rounded-lg text-sm text-center text-slate-800 dark:text-neutral-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">Semester</label>
                      <input
                        type="number"
                        name="semester"
                        value={formData.semester}
                        min={1}
                        max={10}
                        onChange={handleChange}
                        className="input input-box border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-2 rounded-lg text-sm text-center text-slate-800 dark:text-neutral-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">Section</label>
                      <input
                        name="section"
                        value={formData.section}
                        onChange={handleChange}
                        className="input input-box border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-2 rounded-lg text-sm text-center text-slate-800 dark:text-neutral-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Room No & Branch ID */}
                  <div className="flex gap-3">
                    <div className="w-[120px] flex flex-col">
                      <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">Room No</label>
                      <input
                        type="number"
                        name="room_number"
                        value={formData.room_number}
                        onChange={handleChange}
                        className="input input-box border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-2 rounded-lg text-sm text-center text-slate-800 dark:text-neutral-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">Branch ID</label>
                      <input
                        name="branch_id"
                        value={formData.branch_id}
                        onChange={handleChange}
                        className="input input-box border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-2 rounded-lg text-sm text-slate-800 dark:text-neutral-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Branch Name */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">Branch Name</label>
                    <input
                      name="branch_name"
                      value={formData.branch_name}
                      onChange={handleChange}
                      className="input input-box border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-2 rounded-lg text-sm text-slate-800 dark:text-neutral-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Action Footer Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={() => setCurrentEditCell({})}
                  className="px-4 py-2 rounded-md bg-gray-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700 cursor-pointer border-none font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-white border-none font-medium cursor-pointer transition-colors ${currentEditCell.option === 'delete'
                    ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
                    }`}
                  onClick={() => updateSubject(currentEditCell.option === "insert" ? "Insert" : currentEditCell.option === "edit" ? "Update" : "Delete")}
                >
                  {currentEditCell.option === "insert" ? "Insert" : currentEditCell.option === "edit" ? "Update" : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REGULAR POPUP MODAL COMPONENT FOR VIEWING TEACHER LEAVES */}
        {leaveModalVisible && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-neutral-900/90 rounded-2xl p-6 w-[26rem] max-h-[75vh] flex flex-col shadow-2xl">
              <h2 className="text-lg font-bold text-slate-800 dark:text-neutral-100">Teacher Leave Details</h2>
              <p className="text-sm font-semibold text-indigo-600 mb-3">{currentEditCell.item?.teacher_name || "Assigned Faculty"}</p>

              <div className="flex-1 overflow-y-auto pr-1 space-y-2 my-2 custom-scrollbar">
                {teacherLeaves.length > 0 ? (
                  teacherLeaves.map((leave, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800 rounded-xl transition-colors"
                    >
                      {/* Leave Name */}
                      <p className="font-semibold text-slate-800 dark:text-neutral-200 text-sm">
                        {leave.name}
                      </p>

                      {/* Leave Dates */}
                      <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                        {new Date(leave.applicable_from).toLocaleDateString()} &rarr; {new Date(leave.applicable_to).toLocaleDateString()}
                      </p>

                      {/* Status Badge */}
                      <div className="mt-2 flex items-center">
                        <span className="text-[11px] font-bold uppercase bg-slate-200/60 dark:bg-neutral-800 px-2 py-0.5 rounded text-slate-600 dark:text-neutral-300">
                          Status: {leave.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  /* Empty State Fallback */
                  <p className="text-slate-400 dark:text-neutral-500 text-sm text-center py-8">
                    No formal leave logs found for this instructor.
                  </p>
                )}
              </div>

              <button onClick={() => setLeaveModalVisible(false)} className="w-full mt-3 p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl border-none font-bold text-slate-700 cursor-pointer">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTable;