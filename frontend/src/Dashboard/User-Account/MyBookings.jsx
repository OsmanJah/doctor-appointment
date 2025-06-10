import { BASE_URL } from "./../../config";
import useFetchData from "./../../hooks/useFetchData";
import HashLoader from "react-spinners/HashLoader";
import { toast } from 'react-toastify';
import { useState, useContext } from 'react';
import { AuthContext } from "../../context/AuthContext";

const COLLAPSE_LIMIT = 60;

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
};

const MyBookings = () => {

  const { data: bookings, loading, error, refetch } = 
    useFetchData(`${BASE_URL}/users/appointments/my-appointments`);

  const [cancellingId, setCancellingId] = useState(null);
  const { token } = useContext(AuthContext);
  const [openCommentId, setOpenCommentId] = useState(null);
  const [openPrescriptionId, setOpenPrescriptionId] = useState(null);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    if (!token) {
      toast.error("Authentication token not found. Please log in again.");
      setCancellingId(null);
      return;
    }
    setCancellingId(bookingId);
    try {
      const res = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to cancel booking');
      }

      toast.success('Appointment cancelled successfully!');
      refetch(); // Refetch the bookings list to update the UI

    } catch (err) {
      console.error("Cancellation Error:", err);
      toast.error(err.message || 'Could not cancel appointment.');
    } finally {
      setCancellingId(null); // Reset cancelling ID
    }
  };

  return (
    <div>
      {loading && (
        <div className="flex items-center justify-center w-full h-full">
          <HashLoader color="#0067FF" />
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center w-full h-full">
          <h3 className="text-headingColor text-[20px] font-semibold leading-[30px]">
            {error}
          </h3>
        </div>
      )}

      {!loading && !error && (
        bookings && bookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-5">
            {bookings?.map(booking => (
              <div key={booking._id} className="p-4 border rounded-md shadow-sm flex flex-col sm:flex-row sm:gap-6 items-start">

                <div className="flex items-center mb-3 sm:mb-0">
                    <img 
                        src={booking.doctor?.photo || '/default-avatar.png'} 
                        alt={booking.doctor?.name}
                        className="w-12 h-12 rounded-full mr-3 object-cover"
                    />
                    <div>
                        <h3 className="text-lg font-semibold text-headingColor">{booking.doctor?.name || 'Doctor Name N/A'}</h3>
                        <p className="text-sm text-textColor whitespace-nowrap">{booking.doctor?.specialization || 'Specialization N/A'}</p>
                    </div>
                </div>
                

                <div className="text-sm text-textColor mb-3 sm:mb-0 sm:flex-1">
                    <p><strong>Date:</strong> {formatDate(booking.appointmentDateTime)}</p>
                    <p><strong>Time:</strong> {new Date(booking.appointmentDateTime).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                    {booking.comment && (
                      openCommentId === booking._id ? (
                        <p className="whitespace-pre-wrap"><strong>Comment:</strong> {booking.comment} <button onClick={() => setOpenCommentId(null)} className="text-primaryColor underline text-xs ml-1">Hide</button></p>
                      ) : (
                        <p className="" title={booking.comment}>
                          <strong>Comment:</strong> {booking.comment.length > COLLAPSE_LIMIT ? booking.comment.slice(0, COLLAPSE_LIMIT) + '...' : booking.comment}
                          <button onClick={() => setOpenCommentId(booking._id)} className="text-primaryColor underline text-xs ml-1">View</button>
                        </p>
                      )
                    )}
                    {booking.doctorNotes && (
                      openPrescriptionId === booking._id ? (
                        <p className="whitespace-pre-wrap"><strong>Prescription:</strong> {booking.doctorNotes} <button onClick={() => setOpenPrescriptionId(null)} className="text-primaryColor underline text-xs ml-1">Hide</button></p>
                      ) : (
                        <p className="" title={booking.doctorNotes}>
                          <strong>Prescription:</strong> {booking.doctorNotes.length > COLLAPSE_LIMIT ? booking.doctorNotes.slice(0, COLLAPSE_LIMIT) + '...' : booking.doctorNotes}
                          <button onClick={() => setOpenPrescriptionId(booking._id)} className="text-primaryColor underline text-xs ml-1">View</button>
                        </p>
                      )
                    )}
                    <p>
                        <strong>Status:</strong> 
                        <span className={`ml-2 font-medium px-2 py-0.5 rounded-full text-xs 
                            ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                              'bg-gray-100 text-gray-700'}
                        `}>
                           {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                    </p>
                </div>
                

                <div className="w-full sm:w-auto">
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={cancellingId === booking._id} // Disable while cancelling this specific booking
                      className={`w-full sm:w-auto px-3 py-1.5 text-sm rounded-md text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center`}
                    >
                      {cancellingId === booking._id ? <HashLoader size={18} color="#fff" /> : 'Cancel Appointment'}
                    </button>
                  )}
                   {booking.status !== 'confirmed' && (
                    <span className="text-sm text-gray-400 italic">Cannot cancel</span>
                  )} 
                </div>
              </div>
            ))}
          </div>
        ) : (
          <h2 className="mt-5 text-center leading-7 text-[20px] font-semibold text-primaryColor">
            You have not booked any appointments yet!
          </h2>
        )
      )}
    </div>
  );
};

export default MyBookings;
