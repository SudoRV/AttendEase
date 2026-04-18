import { useNavigate } from "react-router-dom";
import { AppStates } from "../services/states";
import { FiLogOut, FiUser } from "react-icons/fi";
import logo from "../images/scheduler_logo.svg";
import messaging from '@react-native-firebase/messaging';

const Sidebar = () => {
  const navigate = useNavigate();
  const { userData } = AppStates();

  async function logout() {
    // simulate logout like buffering or loading 
    localStorage.clear();
    navigate("/login");

    await messaging().deleteToken();
  }

  return (
    <aside className="sidebar flex flex-col md:flex-row p-3">

      <div className="w-full h-20 ml-4 py-12 pt-9 flex justify-start items-center gap-8">
        <div className="h-10 w-10 flex items-center justify-center">
            <img className="h-[80px]" src={logo} alt="logo" />
        </div>

        <div className="flex flex-col items-start">
          <p className="text-lg font-bold font-sans">{userData?.role} Dashboard</p>
        </div>
      </div>
      <div className="w-full h-[1px] bg-gray-100/30"></div>

      <div className="flex gap-3 bg-indigo-500 p-4 mt-4 rounded-md">
        <div className="avatar">
          {
            userData?.avatar ? (
              <img
                className=""
                src="https://via.placeholder.com/100"
                alt="Profile Avatar"
              />
            ) : (
              <FiUser className="text-xl text-slate-300 cursor-pointer" />
            )
          }
        </div>

        <div>
          <p className="font-medium">{userData?.name}</p>
          <p className="text-slate-400">{userData?.email}</p>
        </div>
      </div>

      <div className="flex flex-col bg-indigo-500 p-4 mt-4 rounded-md overflow-hidden break-all text-slate-300">
        {
          userData?.role === "Student" && (
            <>
              <div className="info-item">
                <span>Year</span><span>: {userData?.year}</span>
              </div>

              <div className="info-item">
                <span>Branch</span><span>: {userData?.branch}</span>
              </div>

              <div className="info-item">
                <span>Section</span><span>: {userData?.section}</span>
              </div>
            </>
          )
        }

        <span >Id : {userData?.role === "Student" ? userData?.student_id : userData?.teacher_id}</span>
      </div>

      {/* navigation */}
      <div className="flex-1">
      </div>

      <div className="w-full h-[1px] bg-slate-700"></div>

      <button className="logout-btn mt-auto flex items-center bg-transparent border-none text-gray-100 font-light font-sans gap-3 text-sm p-6 pb-4 !border !border-red-700" onClick={logout}>
        <FiLogOut size={20} />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
