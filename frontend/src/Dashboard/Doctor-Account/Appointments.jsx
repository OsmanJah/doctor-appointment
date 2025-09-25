/* eslint-disable react/prop-types */
import { useState, useContext } from "react";
import { formatDate } from "../../utils/formatDate";
import PrescriptionModal from "./PrescriptionModal";
import { AuthContext } from "../../context/AuthContext.jsx";
import { BASE_URL } from "../../config";
import { toast } from "react-toastify";

const COLLAPSE_LIMIT = 60;

const Appointments = ({ appointments, refetchAppointments }) => {

  const [openCommentId, setOpenCommentId] = useState(null);
  const { token, role } = useContext(AuthContext);
  const [loadingId, setLoadingId] = useState(null); // Track which booking is updating
  const [modalBooking, setModalBooking] = useState(null); // For prescription modal

  const updateStatus = async (bookingId, newStatus) => {
    if (!token) {
      toast.error("You are not authenticated");
      return;
    }
    try {
      setLoadingId(bookingId);
      const res = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to update status");
      }
      toast.success(result.message || "Status updated");
      if (refetchAppointments) refetchAppointments();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error updating status");
    } finally {
      setLoadingId(null);
    }
  };

  // Check if appointments is null, undefined or not an array
  if (!Array.isArray(appointments)) {
      return <p className="text-center py-5 text-gray-500">Loading appointments or no appointments found.</p>;
  }

  // Allowed status transitions for doctor
  const doctorNextStatuses = (current) => {
    switch (current) {
      case 'pending':
        return ['confirmed', 'completed', 'cancelled'];
      case 'confirmed':
        return ['completed', 'cancelled'];
      default:
        return [];
    }
  };

  const sortedAppointments = Array.isArray(appointments)
    ? [...appointments].sort((a, b) => new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime))
    : [];

  return (
    <div>
      <h2 className="text-headingColor text-[24px] font-bold mb-6">My appointments</h2>
      {sortedAppointments.length === 0 ? (
        <p className="text-center py-5 text-gray-500">You have no appointments scheduled.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {sortedAppointments.map(item => (
            <div key={item._id} className="p-4 border rounded-md shadow-sm flex flex-col sm:flex-row sm:gap-6 items-start sm:items-start">

              {/* Patient info */}
              <div className="flex items-center mb-3 sm:mb-0">
                <img src={item.user?.photo || '/default-avatar.png'} alt={item.user?.name || 'Patient'} className="w-12 h-12 rounded-full mr-3 object-cover" />
                <div>
                  <h3 className="text-lg font-semibold text-headingColor">{item.user?.name || 'Patient'}</h3>
                </div>
              </div>

              {/* Booking details */}
              <div className="text-sm text-textColor mb-3 sm:mb-0 sm:mx-4 sm:flex-1">
                <p><strong>Date:</strong> {formatDate(item.appointmentDateTime)}</p>
                <p><strong>Time:</strong> {new Date(item.appointmentDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>

                {item.comment && (
                  openCommentId === item._id ? (
                    <p className="whitespace-pre-wrap"><strong>Comment:</strong> {item.comment} <button onClick={() => setOpenCommentId(null)} className="text-primaryColor underline text-xs ml-1">Hide</button></p>
                  ) : (
                    <p title={item.comment}>
                      <strong>Comment:</strong> {item.comment.length > COLLAPSE_LIMIT ? item.comment.slice(0, COLLAPSE_LIMIT) + '...' : item.comment}
                      <button onClick={() => setOpenCommentId(item._id)} className="text-primaryColor underline text-xs ml-1">View</button>
                    </p>
                  )
                )}

                <p className="mt-1">
                  <strong>Status:</strong>{' '}
                  {role === 'doctor' && doctorNextStatuses(item.status).length > 0 ? (
                    <select
                      className={`border rounded px-2 py-1 text-xs 
                        ${item.status === 'confirmed' ? 'status-confirmed' : 
                          item.status === 'pending' ? 'status-pending' : 
                          item.status === 'cancelled' ? 'status-cancelled' : 
                          'status-completed'}`}
                      value={item.status}
                      disabled={loadingId === item._id}
                      onChange={(e) => updateStatus(item._id, e.target.value)}
                    >
                      <option value={item.status} disabled>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</option>
                      {doctorNextStatuses(item.status).map(opt => (
                        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`status-pill 
                        ${item.status === 'confirmed' ? 'status-confirmed' : 
                          item.status === 'pending' ? 'status-pending' : 
                          item.status === 'cancelled' ? 'status-cancelled' : 
                          'status-completed'}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                  )}
                </p>
              </div>

              {/* Actions */}
              {role === 'doctor' && (
                <div className="w-full sm:w-auto">
                  <button onClick={() => setModalBooking(item)} className="text-primaryColor underline text-sm">Add Prescription</button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {modalBooking && (
        <PrescriptionModal
          booking={modalBooking}
          onClose={() => setModalBooking(null)}
          onSaved={() => {
            setModalBooking(null);
            if (refetchAppointments) refetchAppointments();
          }}
        />
      )}
    </div>
  );
};

export default Appointments;
