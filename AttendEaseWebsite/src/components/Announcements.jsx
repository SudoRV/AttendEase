import { AppStates } from "../services/states";
import { FiBell, FiUser, FiClock, FiInbox, FiCheckCircle } from "react-icons/fi";

const Announcements = () => {
  const { announcements, userData } = AppStates();

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Modern Header with Count Badge */}
      <div className="flex items-center justify-between px-4 py-2 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Announcements
          </h2>
          <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-0.5">
            Latest Updates
          </p>
        </div>
        {announcements?.filter(a => new Date() - new Date(a.created_at).getTime() < 3600000)?.length > 0 && (
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            {announcements?.filter(a => new Date() - new Date(a.created_at).getTime() < 3600000).length} New
          </span>
        )}
      </div>

      {/* Announcements List Wrapper */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
        {announcements && announcements.length > 0 ? (
          <div className="flex flex-col gap-4 pb-6">
            {announcements.map((announcement, index) => (
              /* --- Your Existing Card Component (Kept as requested) --- */
              <div
                key={index}
                className="mx-4 rounded-[20px] p-4 text-white shadow-xl flex flex-col transition-all hover:scale-[1.01] bg-gradient-to-br from-indigo-500 to-indigo-600"
                style={{ boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.3)' }}
              >
                <div className="flex flex-row justify-between items-start gap-2">
                  <div className="flex-1 mr-2">
                    <h3 className="text-xl font-bold tracking-tight leading-tight">
                      {announcement.title}
                    </h3>
                  </div>

                  {
                    announcement.scope === "teachers" && (
                      <p className="text-xs bg-red-500 p-1 px-2 rounded-full">for teachers</p>
                    )
                  }

                  {
                    announcement?.created_by?.id === userData?.teacher_id && (
                      <p className="text-xs bg-green-500 p-1 px-2 rounded-full">by you</p>
                    )
                  }

                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm aspect-square">
                    <FiBell size={16} color="white" />
                  </div>
                </div>

                <p className="text-indigo-50 pt-2 leading-relaxed text-base opacity-90 font-light">
                  {announcement.body}
                </p>

                <div className="h-[1px] bg-white/10 my-2 w-full" />

                <div className="flex flex-row justify-between items-center mt-auto">
                  <div className="flex flex-row items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center border border-white/20">
                      <FiUser size={12} color="white" />
                    </div>
                    <span className="text-sm font-medium">
                      {announcement.created_by?.name || "Admin"}
                    </span>
                  </div>

                  <div className="flex flex-row items-center gap-1.5 opacity-80">
                    <FiClock size={14} color="white" />
                    <span className="text-xs font-light tracking-wide">
                      {new Date(announcement.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              /* --- End Card --- */
            ))}

            {/* Modern "End of List" Indicator */}
            <div className="flex flex-col items-center justify-center py-6 gap-2 opacity-40">
              <FiCheckCircle size={20} className="text-neutral-500" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                End of Notifications
              </p>
            </div>
          </div>
        ) : (
          /* Modern Empty State */
          <div className="flex flex-col items-center justify-center h-64 text-center px-8">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 border border-dashed border-neutral-300 dark:border-neutral-700">
              <FiInbox size={32} className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">No announcements</h3>
            <p className="text-sm text-neutral-500 mt-1">
              Check back later for important updates and notifications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;