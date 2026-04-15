import Announcements from "../components/Announcements";
import Navigation from "../components/ProfileCard";
import LeaveBox from "../components/Student_Leave";
import TimeTable from "../components/TimeTable";


const StudentDashboard = () => {
  return (
    <>
      <div className="flex h-full">

        

        <div className="dashboard overflow-hidden overflow-y-auto">
          <div className="sidebar">
          <Navigation />
        </div>
          <div className="timetable-section">
            <TimeTable />
          </div>

          <div className="leave-management card other">
            <LeaveBox />
          </div>

          <div className="announcements card other">
            <Announcements />
          </div>

        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
