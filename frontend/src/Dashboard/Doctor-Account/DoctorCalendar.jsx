import { useState, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { formatDate } from "../../utils/formatDate";

// eslint-disable-next-line react/prop-types
const DoctorCalendar = ({ appointments = [] }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  // Group appointments by date string (e.g. "Mon Jun 10 2025")
  const appointmentsByDate = useMemo(() => {
    const map = {};
    appointments.forEach((appt) => {
      const dateStr = new Date(appt.appointmentDateTime).toDateString();
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(appt);
    });
    return map;
  }, [appointments]);

  // Dot indicator on calendar if the day has appointments
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toDateString();
      if (appointmentsByDate[dateStr]) {
        return (
          <div className="w-1 h-1 rounded-full bg-primaryColor mx-auto mt-1"></div>
        );
      }
    }
    return null;
  };

  const selectedDateStr = selectedDate?.toDateString();
  const list = selectedDateStr ? appointmentsByDate[selectedDateStr] || [] : [];

  return (
    <div>
      <h2 className="text-headingColor text-[24px] font-bold mb-6">Calendar</h2>
      <Calendar
        value={selectedDate}
        onClickDay={setSelectedDate}
        tileContent={tileContent}
        className="react-calendar border-none shadow-panelShadow doctor-dark-calendar"
      />

      {selectedDate && (
        <div className="mt-6">
          <h3 className="text-headingColor font-semibold mb-2">
            Appointments on {formatDate(selectedDate)}
          </h3>
          {list.length ? (
            <ul className="space-y-2">
              {list.map((item) => (
                <li
                  key={item._id}
                  className="p-3 border rounded text-sm flex justify-between items-center"
                >
                  <span>
                    {new Date(item.appointmentDateTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" — "}
                    {item.user?.name || "Patient"}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 capitalize">
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No appointments.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorCalendar;
