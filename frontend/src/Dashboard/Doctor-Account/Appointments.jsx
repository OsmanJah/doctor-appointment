/* eslint-disable react/prop-types */
import { useState } from "react";
import { formatDate } from "../../utils/formatDate";

const Appointments = ({ appointments }) => {

  const [openCommentId, setOpenCommentId] = useState(null);

  // Check if appointments is null, undefined or not an array
  if (!Array.isArray(appointments)) {
      return <p className="text-center py-5 text-gray-500">Loading appointments or no appointments found.</p>;
  }

  return (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 ">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 ">
            <tr>
              <th scope="col" className="px-6 py-3">
                Patient Name
              </th>
              <th scope="col" className="px-6 py-3">
                Appointment Date
              </th>
              <th scope="col" className="px-6 py-3">
                Time
              </th>
              <th scope="col" className="px-6 py-3">
                Comment
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
                 <tr>
                    <td colSpan="5" className="text-center py-5 text-gray-500">
                        You have no appointments scheduled.
                    </td>
                </tr>
            ) : (
                appointments.map(item => (
                  <tr key={item._id} className="bg-white border-b hover:bg-gray-50 ">

                    <td className="px-6 py-4">
                      <div className="flex items-center">
                          <img
                            className="w-10 h-10 rounded-full object-cover mr-3"
                            src={item.user?.photo || '/default-avatar.png'}
                            alt={item.user?.name || 'Patient'}
                          />
                          <div className="pl-1">
                            <div className="text-base font-semibold text-gray-900">{item.user?.name || 'N/A'}</div>
                          </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">{formatDate(item.appointmentDateTime)}</td>

                    <td className="px-6 py-4">
                      {new Date(item.appointmentDateTime).toLocaleTimeString("en-US", 
                        { hour: '2-digit', minute: '2-digit', hour12: true }
                      )}
                    </td>

                    <td className="px-6 py-4 max-w-[250px]">
                      {item.comment ? (
                        openCommentId === item._id ? (
                          <div>
                            <p className="whitespace-pre-wrap text-gray-700 mb-2">{item.comment}</p>
                            <button onClick={() => setOpenCommentId(null)} className="text-primaryColor underline text-xs">Hide</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[180px] inline-block" title={item.comment}>{item.comment}</span>
                            <button onClick={() => setOpenCommentId(item._id)} className="text-primaryColor underline text-xs">View</button>
                          </div>
                        )
                      ) : '—'}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`font-medium px-2 py-1 rounded-full text-xs 
                            ${item.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                              item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                              item.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                              item.status === 'completed' ? 'bg-blue-100 text-blue-700' : 
                              'bg-gray-100 text-gray-700'}
                      `}>
                           {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
    </div>
  );
};

export default Appointments;
