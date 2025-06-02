/* eslint-disable react/prop-types */

import { useState, useEffect, useContext } from 'react';
// import { BASE_URL, token } from "./../../config"; // Token will come from AuthContext
import { BASE_URL } from "./../../config";
import { toast } from 'react-toastify';
import HashLoader from 'react-spinners/HashLoader';
import { AuthContext } from '../../context/AuthContext';

const SidePanel = ({ ticketPrice, doctorId, doctorName }) => {
  const { user, role, token: authToken } = useContext(AuthContext); // Use authToken from context

  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errorSlots, setErrorSlots] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  // const [fetchedTicketPrice, setFetchedTicketPrice] = useState(null); // If we need to use ticketPrice from slot endpoint

  useEffect(() => {
    if (!selectedDate || !doctorId) {
      setAvailableSlots([]);
      return;
    }
    if (!authToken) { // Check if authToken is available before fetching
        setErrorSlots("Please log in to see available slots.");
        toast.warn("Please log in to see available slots.");
        setLoadingSlots(false);
        return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setErrorSlots(null);
      setAvailableSlots([]);
      setSelectedSlot(null);
      // setFetchedTicketPrice(null); // Reset if fetching ticket price from this endpoint
      try {
        const res = await fetch(
          `${BASE_URL}/doctors/${doctorId}/available-slots?date=${selectedDate}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${authToken}`, // Use authToken from context
            },
          }
        );

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || 'Failed to fetch slots');
        }

        if (result.success && result.data) {
          setAvailableSlots(result.data.availableSlots || []); // Access nested availableSlots
          // setFetchedTicketPrice(result.data.ticketPrice); // Optionally set ticket price if design requires it from here
          if ((result.data.availableSlots || []).length === 0) {
            setErrorSlots("No slots available for this date.");
          }
        } else {
          setErrorSlots(result.message || "Could not parse available slots.");
          setAvailableSlots([]);
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
        setErrorSlots(err.message);
        toast.error(err.message || 'Could not fetch available slots.');
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, doctorId, authToken]); // Add authToken to dependency array

  const today = new Date().toISOString().split('T')[0];

  const handleBooking = async () => {
    if (!user || role !== 'patient') {
        toast.error("Please log in as a patient to book.");
        return;
    }
    if (!selectedDate || !selectedSlot) {
      toast.warn("Please select a date and time slot.");
      return;
    }
    if (!authToken) {
        toast.error("Authentication token not found. Please log in again.");
        return;
    }

    setBookingLoading(true);
    try {
      // Combine date and time into a single Date object for the backend
      const [hours, minutes] = selectedSlot.split(':');
      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(parseInt(hours, 10));
      appointmentDateTime.setMinutes(parseInt(minutes, 10));
      appointmentDateTime.setSeconds(0);
      appointmentDateTime.setMilliseconds(0);

      const res = await fetch(`${BASE_URL}/bookings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`, 
          },
          body: JSON.stringify({
            doctorId: doctorId,
            appointmentDate: selectedDate, // "YYYY-MM-DD"
            appointmentTime: selectedSlot // "HH:mm"
          })
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Booking failed. Please try again.');
      }

      if (result.success) {
        toast.success('Appointment booked successfully!');
        setSelectedDate('');
        setSelectedSlot(null);
        setAvailableSlots([]); // Clear slots after successful booking
        setErrorSlots(null); // Clear any previous slot errors
        // Potentially refetch user's appointments or navigate
      } else {
         toast.error(result.message || 'Booking failed. Please try again.');
      }

    } catch (err) {
      console.error("Booking Error:", err);
      toast.error(err.message || 'An error occurred during booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className=" shadow-panelShadow p-3 lg:p-5 rounded-md bg-lightTealBg">
      <div className="flex items-center justify-between">
        <p className="text__para mt-0 font-semibold">Consultation Fee</p>
        <span className="text-[16px] leading-7 lg:text-[22px] lg:leading-8 text-headingColor font-bold">
          {ticketPrice ? `${ticketPrice.toLocaleString("hu-HU")} HUF` : 'N/A'} 
        </span>
      </div>

      <div className="mt-[30px]">
        <p className="text__para mt-0 font-semibold text-headingColor">
          Select Appointment Date:
        </p>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={today} // Prevent selecting past dates
          className="form__input mt-2 w-full"
          disabled={bookingLoading || !authToken} // Disable if not logged in or booking
        />
      </div>

      <div className="mt-[30px]">
        <p className="text__para mt-0 font-semibold text-headingColor">
          Available Time Slots:
        </p>
        {selectedDate ? (
            loadingSlots ? (
                <div className="flex justify-center py-3">
                    <HashLoader size={25} color="#4FD1C5" />
                </div>
            ) : availableSlots.length > 0 ? (
                <ul className="mt-3 grid grid-cols-3 gap-2">
                    {availableSlots.map((slot, index) => (
                        <li key={index} className="mb-1">
                            <button
                                onClick={() => setSelectedSlot(slot)}
                                disabled={bookingLoading} // Disable during booking process
                                className={`py-2 px-1 border rounded-md text-center w-full text-sm 
                                ${selectedSlot === slot 
                                    ? 'bg-buttonBgColor text-white border-buttonBgColor' 
                                    : 'border-gray-300 text-textColor hover:bg-gray-100 disabled:opacity-50'}
                                `}
                            >
                                {slot} 
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                 <p className="text-textColor text-sm py-2">{errorSlots || "No slots available for this date."}</p>
            )
        ) : (
            <p className="text-textColor text-sm py-2">Please select a date to see available slots.</p>
        )}
      </div>

      {role === 'patient' && authToken && (
        <button 
          onClick={handleBooking} 
          className="px-2 btn w-full rounded-md mt-5 flex items-center justify-center"
          disabled={!selectedDate || !selectedSlot || loadingSlots || bookingLoading}
        >
          {bookingLoading ? <HashLoader size={25} color="#fff" /> : 'Book Appointment'}
        </button>
      )}
      {role && role !== 'patient' && authToken && (
          <p className="text-center text-sm text-gray-500 mt-4">Log in as a patient to book.</p>
      )}
      {!authToken && (
          <p className="text-center text-sm text-gray-500 mt-4">Please log in to book an appointment.</p>
      )}
    </div>
  );
};

export default SidePanel;
