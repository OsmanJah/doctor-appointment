import PropTypes from "prop-types";
import { useMemo } from "react";

const StatCard = ({ label, value, bg, text }) => (
  <div className={`flex flex-col items-center justify-center p-4 rounded-md shadow-sm ${bg} ${text} w-full sm:w-40`}>
    <span className="text-2xl font-bold">{value}</span>
    <span className="text-xs uppercase tracking-wide mt-1">{label}</span>
  </div>
);

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  bg: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

const DoctorAnalytics = ({ appointments = [] }) => {
  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter((a) => a.status === "completed").length;
    const cancelled = appointments.filter((a) => a.status === "cancelled").length;
    const upcoming = appointments.filter((a) => ["pending", "confirmed"].includes(a.status)).length;
    return { total, completed, cancelled, upcoming };
  }, [appointments]);

  return (
    <div>
      <h2 className="text-headingColor text-[24px] font-bold mb-6">Analytics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={stats.total} bg="bg-gray-100" text="text-gray-700" />
        <StatCard label="Upcoming" value={stats.upcoming} bg="bg-yellow-100" text="text-yellow-700" />
        <StatCard label="Completed" value={stats.completed} bg="bg-green-100" text="text-green-700" />
        <StatCard label="Cancelled" value={stats.cancelled} bg="bg-red-100" text="text-red-700" />
      </div>
    </div>
  );
};

DoctorAnalytics.propTypes = {
  appointments: PropTypes.array,
};

export default DoctorAnalytics;
