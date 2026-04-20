import { AppStates } from "../services/states";
import { IoNotificationsOutline, IoPerson, IoTimeOutline } from "react-icons/io5";

const Announcements = () => {

  const { announcements } = AppStates();

  return (
    <div className="h-full flex flex-col items-center">
      <h2 className="headings !m-0 !p-0">Announcements</h2><br />
      <div className="announcements-container w-full flex-1 flex flex-col gap-3">
        {announcements && announcements.length > 0 ? (
          announcements.map((announcement, index) => (
            <div
            key={index}
              className="mb-4 rounded-[20px] p-4 text-white shadow-xl flex flex-col transition-all hover:scale-[1.01] bg-gradient-to-br from-indigo-500 to-indigo-600"
              style={{
                
                boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.3)'
              }}
            >
              {/* Header Row: Title + Icon */}
              <div className="flex flex-row justify-between items-start">
                <div className="flex-1 mr-2">
                  {/* Using tracking-tight as you asked about letter-spacing earlier */}
                  <h3 className="text-xl font-bold tracking-tight leading-tight">
                    {announcement.title}
                  </h3>
                </div>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm aspect-square">
                  <IoNotificationsOutline size={18} color="white" />
                </div>
              </div>

              {/* Body: Softened text for better readability */}
              <p className="text-indigo-50 mt-2 pt-2 pb-2 leading-relaxed text-base opacity-90 font-light flex flex-wrap overflow-scroll custom-scrollbar">
                {announcement.body}
              </p>

              {/* Separator Line */}
              <div className="h-[1px] bg-white/10 my-4 w-full" />

              {/* Footer: Multi-column layout */}
              <div className="flex flex-row justify-between items-center mt-auto">

                {/* Author */}
                <div className="flex flex-row items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center border border-white/20">
                    <IoPerson size={12} color="white" />
                  </div>
                  <span className="text-sm font-medium">
                    {announcement.created_by?.name || "Admin"}
                  </span>
                </div>

                {/* Timestamp */}
                <div className="flex flex-row items-center gap-1.5 opacity-80">
                  <IoTimeOutline size={14} color="white" />
                  <span className="text-xs font-light tracking-wide">
                    {new Date(announcement.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No announcements available</p>
        )}
      </div>
    </div>
  );
};

export default Announcements;
