/* eslint-disable react/prop-types */
import { useEffect, useState, useContext } from "react";
import { BASE_URL } from "../../config";
import { AuthContext } from "../../context/AuthContext";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";

const Profile = ({ doctorData, refetchDoctorData }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    photo: null,
    bio: "",
    about: "",
    ticketPrice: 0,
    specialization: "",
    timeSlots: [],
    qualifications: [],
    experiences: [],
    locations: [],
  });
  const [newPassword, setNewPassword] = useState("");

  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (doctorData) {
        setFormData({
          name: doctorData.name || "",
          email: doctorData.email || "",
          photo: doctorData.photo || null,
          phone: doctorData.phone || "",
          bio: doctorData.bio || "",
          about: doctorData.about || "",
          ticketPrice: doctorData.ticketPrice || 0,
          specialization: doctorData.specialization || "",
          timeSlots: doctorData.timeSlots || [],
          qualifications: doctorData.qualifications || [],
          experiences: doctorData.experiences || [],
          locations: doctorData.locations || [],
        });
    }
  }, [doctorData]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    if (name === 'ticketPrice') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNewPasswordChange = e => {
    setNewPassword(e.target.value);
  };

  const handleFileInputChange = async event => {
    const file = event.target.files[0];
    if (file) {
      try {
        const data = await uploadImageToCloudinary(file);
        setSelectedFile(data.url);
        setFormData({ ...formData, photo: data.url });
        toast.success("Photo uploaded successfully!");
      } catch (uploadError) {
        toast.error(uploadError.message || "Photo upload failed.");
      }
    }
  };

  const updateDoctorHandler = async e => {
    e.preventDefault();
    if (!token) {
      toast.error("Authentication required. Please log in.");
      return;
    }

    const finalFormData = {
      ...formData,
      qualifications: formData.qualifications.filter(q => q.degree && q.university && q.year),
      experiences: formData.experiences,
      locations: formData.locations ? formData.locations.map(loc => String(loc).trim()).filter(loc => loc !== '') : [],
      timeSlots: formData.timeSlots.filter(ts => ts.day && ts.startTime && ts.endTime && ts.slotDurationMinutes > 0),
    };
    if (newPassword && newPassword.trim() !== "") {
      finalFormData.password = newPassword;
    }

    try {
      const res = await fetch(`${BASE_URL}/doctors/${doctorData._id}`, {
        method: "put",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalFormData),
      });

      const result = await res.json();
      if (!res.ok) {
        return toast.error(result.message || "Profile update failed");
      }

      toast.success("Profile updated successfully!");
      setNewPassword("");
      if (refetchDoctorData) {
        refetchDoctorData();
      }
    } catch (err) {
      console.error("Update Profile Error:", err);
      toast.error(err.message || "An error occurred while updating the profile.");
    }
  };

  const addItem = (key, item) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [key]: [...(prevFormData[key] || []), item],
    }));
  };

  const handleReuseableInputChangeFunc = (key, index, event) => {
    const { name, value } = event.target; 
    setFormData(prevFormData => {
      const updatedItems = [...(prevFormData[key] || [])]; 

      if (updatedItems[index]) {
          const updatedItem = { ...updatedItems[index] }; 
          updatedItem[name] = value;
          updatedItems[index] = updatedItem; 
      }
      
      return {
        ...prevFormData,
        [key]: updatedItems,
      };
    });
  };

  const deleteItem = (key, index) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [key]: (prevFormData[key] || []).filter((_, i) => i !== index),
    }));
  };

  const addTimeSlot = e => {
    e.preventDefault();
    addItem("timeSlots", { 
        day: "Monday",
        startTime: "09:00",
        endTime: "17:00",
        slotDurationMinutes: 30
    });
  };

  const handleTimeSlotChange = (event, index) => {
    const { name, value: rawValue } = event.target;
    let value = rawValue;
    if (name === 'slotDurationMinutes') {
        value = parseInt(rawValue, 10) || 0;
    }
    handleReuseableInputChangeFunc("timeSlots", index, { target: { name, value } });
  };

  const deleteTimeSlot = (e, index) => {
    e.preventDefault();
    deleteItem("timeSlots", index);
  };

  const addQualification = (e) => {
    e.preventDefault();
    addItem("qualifications", { degree: "", university: "", year: "" });
  };

  const handleQualificationChange = (event, index) => {
    handleReuseableInputChangeFunc("qualifications", index, event);
  };

  const deleteQualification = (e, index) => {
    e.preventDefault();
    deleteItem("qualifications", index);
  };

  const addExperience = (e) => {
    e.preventDefault();
    addItem("experiences", { position: "", hospital: "", duration: "" });
  };

  const handleExperienceChange = (event, index) => {
    handleReuseableInputChangeFunc("experiences", index, event);
  };

  const deleteExperience = (e, index) => {
    e.preventDefault();
    deleteItem("experiences", index);
  };

  const addLocation = (e) => {
    e.preventDefault();
    addItem("locations", ""); // Add an empty string for a new location
  };

  const handleLocationChange = (event, index) => {
    const { value } = event.target;
    setFormData(prevFormData => {
      const updatedLocations = [...(prevFormData.locations || [])];
      updatedLocations[index] = value;
      return {
        ...prevFormData,
        locations: updatedLocations,
      };
    });
  };

  const deleteLocation = (e, index) => {
    e.preventDefault();
    deleteItem("locations", index);
  };

  return (
    <div>
      <h2 className="text-headingColor font-bold text-[24px] leading-9 mb-10">
        Profile Information
      </h2>
      <form onSubmit={updateDoctorHandler}>
        <div className="mb-5">
          <p className="form__label">Name*</p>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Full Name"
            className="form__input"
          />
        </div>
        <div className="mb-5">
          <p className="form__label">Email</p>
          <input
            type="email"
            readOnly
            value={formData.email}
            name="email"
            placeholder="Enter Your Email"
            className="form__input bg-gray-100"
            aria-readonly
          />
        </div>
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <p className="form__label mb-0">Bio <span className="text-gray-400 text-xs">(max 100 characters)</span></p>
            <span className="text-xs text-gray-500 ml-2">{formData.bio.length}/100</span>
          </div>
          <input
            type="text"
            value={formData.bio}
            onChange={handleInputChange}
            name="bio"
            maxLength={100}
            placeholder="E.g., Cardiologist at City Hospital"
            className="form__input"
          />
        </div>
        <div className="mb-5">
          <p className="form__label">New Password</p>
          <input
            type="password"
            value={newPassword}
            onChange={handleNewPasswordChange}
            name="newPassword"
            placeholder="Leave blank to keep current password"
            className="form__input"
          />
        </div>
        <div className="mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-[30px]">
            <div>
              <p className="form__label">Specialization</p>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className="form__input py-3.5"
              >
                <option value="">Select</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Endocrinologist">Endocrinologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
                <option value="Hematologist">Hematologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Oncologist">Oncologist</option>
                <option value="Ophthalmologist">Ophthalmologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Psychiatrist">Psychiatrist</option>
                <option value="Pulmonologist">Pulmonologist</option>
                <option value="Radiologist">Radiologist</option>
                <option value="Surgeon">Surgeon</option>
                <option value="Urologist">Urologist</option>
              </select>
            </div>
            <div>
              <p className="form__label">Consultation Fee (HUF)</p>
              <input
                type="number"
                name="ticketPrice"
                value={formData.ticketPrice}
                placeholder="Enter fee"
                className="form__input"
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>
        </div>
        <div className="mt-10">
          <p className="form__label">Time Slots</p>
          {formData.timeSlots?.map((item, index) => (
            <div key={index} className="mb-4 p-3 border rounded">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 items-end">
                <div>
                  <p className="form__label text-xs">Day*</p>
                  <select 
                    name="day" 
                    value={item.day} 
                    className="form__input py-2.5" 
                    onChange={e => handleTimeSlotChange(e, index)}>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div>
                  <p className="form__label text-xs">Starting Time*</p>
                  <input
                    type="time"
                    name="startTime"
                    value={item.startTime}
                    className="form__input py-2.5"
                    onChange={e => handleTimeSlotChange(e, index)}
                  />
                </div>
                <div>
                  <p className="form__label text-xs">Ending Time*</p>
                  <input
                    type="time"
                    name="endTime"
                    value={item.endTime}
                    className="form__input py-2.5"
                    onChange={e => handleTimeSlotChange(e, index)}
                  />
                </div>
                 <div>
                  <p className="form__label text-xs">Slot Duration (min)*</p>
                  <input
                    type="number"
                    name="slotDurationMinutes"
                    value={item.slotDurationMinutes}
                    className="form__input py-2.5"
                    onChange={e => handleTimeSlotChange(e, index)}
                    min="15"
                  />
                </div>
                <div className="col-span-full md:col-span-1 flex justify-end md:justify-start mt-2 md:mt-0">
                  <button 
                    onClick={e => deleteTimeSlot(e, index)} 
                    className="text-red-600 hover:text-red-800 transition-colors duration-200 p-2 rounded-full hover:bg-red-100"
                  >
                    <AiOutlineDelete size={22} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button 
            onClick={addTimeSlot} 
            className="bg-primaryColor hover:bg-primaryColorHover text-white font-semibold py-2 px-4 rounded text-sm"
          >
            Add Time Slot
          </button>
        </div>
        <div className="mb-5 border-t pt-5 mt-5">
          <p className="form__label">Qualifications*</p>
          {formData.qualifications?.map((item, index) => (
            <div key={index} className="mb-3">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="form__label">Degree*</p>
                  <input
                    type="text"
                    name="degree"
                    value={item.degree}
                    className="form__input"
                    onChange={e => handleQualificationChange(e, index)}
                    placeholder="E.g., MD"
                  />
                </div>
                <div>
                  <p className="form__label">University*</p>
                  <input
                    type="text"
                    name="university"
                    value={item.university}
                    className="form__input"
                    onChange={e => handleQualificationChange(e, index)}
                    placeholder="E.g., University of Debrecen"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5 mt-3">
                 <div>
                  <p className="form__label">Year*</p>
                  <input
                    type="text"
                    name="year"
                    value={item.year}
                    className="form__input"
                    onChange={e => handleQualificationChange(e, index)}
                    placeholder="E.g., 2010"
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={e => deleteQualification(e, index)} 
                    className="text-red-600 hover:text-red-800 transition-colors duration-200 p-2 ml-2 mb-1 rounded-full hover:bg-red-100"
                  >
                    <AiOutlineDelete size={22} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button 
            onClick={addQualification} 
            className="bg-primaryColor hover:bg-primaryColorHover text-white font-semibold py-2 px-4 rounded text-sm"
          >
            Add Qualification
          </button>
        </div>
        <div className="mb-5 border-t pt-5 mt-5">
          <p className="form__label">Experiences</p>
          {formData.experiences?.map((item, index) => (
            <div key={index} className="mb-3">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="form__label">Position</p>
                  <input
                    type="text"
                    name="position"
                    value={item.position}
                    className="form__input"
                    onChange={e => handleExperienceChange(e, index)}
                    placeholder="E.g., Senior Cardiologist"
                  />
                </div>
                <div>
                  <p className="form__label">Hospital</p>
                  <input
                    type="text"
                    name="hospital"
                    value={item.hospital}
                    className="form__input"
                    onChange={e => handleExperienceChange(e, index)}
                    placeholder="E.g., City General Hospital"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5 mt-3">
                <div>
                  <p className="form__label">Duration</p>
                  <input
                    type="text"
                    name="duration"
                    value={item.duration}
                    className="form__input"
                    onChange={e => handleExperienceChange(e, index)}
                    placeholder="E.g., 2015 - Present"
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={e => deleteExperience(e, index)} 
                    className="text-red-600 hover:text-red-800 transition-colors duration-200 p-2 ml-2 mb-1 rounded-full hover:bg-red-100"
                  >
                    <AiOutlineDelete size={22} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button 
            onClick={addExperience} 
            className="bg-primaryColor hover:bg-primaryColorHover text-white font-semibold py-2 px-4 rounded text-sm"
          >
            Add Experience
          </button>
        </div>

        {/* =============== locations form =============== */}
        <div className="mb-5 border-t pt-5 mt-5">
          <p className="form__label">Practice Locations</p>
          {formData.locations?.map((item, index) => (
            <div key={index} className="mb-3">
              <div className="flex items-center">
                <input
                  type="text"
                  name={`location-${index}`}
                  value={item}
                  onChange={e => handleLocationChange(e, index)}
                  placeholder="E.g., Nagyerdei krt. 98, Debrecen OR Kenézy Gyula Kórház, Debrecen"
                  className="form__input flex-1"
                />
                <button 
                  onClick={e => deleteLocation(e, index)} 
                  className="text-red-600 hover:text-red-800 transition-colors duration-200 p-2 ml-2 rounded-full hover:bg-red-100"
                >
                  <AiOutlineDelete size={22} />
                </button>
              </div>
            </div>
          ))}
          <button 
            onClick={addLocation} 
            className="bg-primaryColor hover:bg-primaryColorHover text-white font-semibold py-2 px-4 rounded text-sm"
          >
            Add Location
          </button>
        </div>

        <div className="mb-5 border-t pt-5 mt-5">
          <p className="form__label">About</p>
          <textarea
            rows={5}
            value={formData.about}
            onChange={handleInputChange}
            name="about"
            placeholder="Provide details about your background, approach, and services offered."
            className="form__input"
          />
        </div>
        <div className="mb-5 flex items-center gap-3">
          {formData.photo && (
            <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center">
              <img 
                src={formData.photo} 
                alt="Doctor profile preview" 
                className="w-full rounded-full" 
              />
            </figure>
          )}
          <div className="relative inline-block w-[130px] h-[50px]">
            <input
              className="custom-file-input absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              id="customFileDoctor"
              name="photo"
              type="file"
              accept=".jpg,.png,image/jpeg,image/png"
              onChange={handleFileInputChange}
            />
            <label
              className="custom-file-label absolute top-0 left-0 w-full h-full flex items-center justify-center px-[0.75rem] py-[0.375rem] text-[15px] leading-6 overflow-hidden bg-primaryColor/30 text-headingColor font-semibold rounded-lg truncate cursor-pointer hover:bg-primaryColor/40 transition-colors duration-200"
              htmlFor="customFileDoctor"
            >
              {selectedFile ? "Photo Selected" : "Upload Photo"}
            </label>
          </div>
        </div>
        <div className="mt-10">
          <button
            type="submit"
            className="btn w-full text-[18px] leading-[30px]"
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
