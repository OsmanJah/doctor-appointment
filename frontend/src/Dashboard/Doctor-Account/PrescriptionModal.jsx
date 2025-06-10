import { useState, useContext } from "react";
import { BASE_URL } from "../../config";
import { AuthContext } from "../../context/AuthContext.jsx";
import { toast } from "react-toastify";

/* eslint-disable react/prop-types */
const overlayStyle = "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50";
const modalStyle = "bg-white rounded-lg shadow-lg w-full max-w-md p-6";

const PrescriptionModal = ({ booking, onClose, onSaved }) => {
  const { token } = useContext(AuthContext);
  const [notes, setNotes] = useState(booking?.doctorNotes || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Authentication required");
      return;
    }
    try {
      setSubmitting(true);
      if (!notes.trim()) {
        toast.error("Please enter prescription text");
        return;
      }

      const res = await fetch(`${BASE_URL}/bookings/${booking._id}/prescription`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ doctorNotes: notes }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to save prescription");
      }
      toast.success("Prescription saved");
      onSaved();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error saving prescription");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={overlayStyle} onClick={onClose}>
      <div className={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">Add Prescription</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Prescription Text</label>
            <textarea
              className="w-full border rounded p-2 text-sm"
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primaryColor text-white rounded text-sm disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionModal;
