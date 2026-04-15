import { AppStates } from "../services/states";

const Announcements = () => {

  const { announcements } = AppStates();

  return (
    <div className="announcements h-full flex flex-col items-center">
      <h2 className="headings !m-0 !p-0">Announcements</h2><br />
      <div className="announcements-container w-full flex-1 flex flex-col gap-3">
        {announcements && announcements.length > 0 ? (
          announcements.map((announcement, index) => (
            <div key={index} className="bg-indigo-200 rounded-lg p-4 mx-4 flex flex-col">
              <p className="text-lg font-bold">{announcement.title}</p>
              <p>{announcement.body}</p>

              <div className="flex justify-between mt-2">
                <p className="">By  -- {announcement.created_by.name}</p>
                <p className="">Posted At: {new Date(announcement.created_at).toLocaleString()}</p>
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
