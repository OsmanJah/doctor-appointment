/* eslint-disable react/prop-types */
import { useEffect, useState, useContext } from "react";
import { BASE_URL } from "../../config";
import { AuthContext } from "../../context/AuthContext";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";

import { toast } from "react-toastify";

const Profile = ({ userData, refetchUserData }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    bloodType: "",
    photo: null,
  });
  const [newPassword, setNewPassword] = useState("");

  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        bloodType: userData.bloodType || "",
        gender: userData.gender || "",
        photo: userData.photo || null,
      });
    }
  }, [userData]);

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNewPasswordChange = e => {
    setNewPassword(e.target.value);
  };

  const handleFileInputChange = async event => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      // Add loading state if needed
      const data = await uploadImageToCloudinary(file);
      
      // Update UI with the new image URL
      setSelectedFile(data.url);
      setFormData({ ...formData, photo: data.url });
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error(error.message || "Image upload failed. Please try again.");
      console.error("Image Upload Error:", error);
    }
  };

  const updateUserHandler = async e => {
    e.preventDefault();
    if (!token) {
      toast.error("Authentication required. Please log in.");
      return;
    }

    const updateData = { ...formData };
    if (newPassword && newPassword.trim() !== "") {
      updateData.password = newPassword;
    }

    try {
      const res = await fetch(`${BASE_URL}/users/${userData._id}`, {
        method: "put",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await res.json();
      if (!res.ok) {
        return toast.error(result.message || "Failed to update profile.");
      }

      toast.success("Profile updated successfully!");
      setNewPassword("");
      if (refetchUserData) {
        refetchUserData();
      }
    } catch (err) {
      console.error("Profile Update Error:", err);
      toast.error(err.message || "An error occurred while updating.");
    }
  };

  return (
    <div>
      <form onSubmit={updateUserHandler}>
        <div className="mb-5">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Full Name"
            className="w-full pr-4 py-3 border-b border-solid border-primaryColor/40 focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor"
          />
        </div>
        <div className="mb-5">
          <input
            type="email"
            readOnly
            value={formData.email}
            name="email"
            placeholder="Enter Your Email"
            className="w-full pr-4 py-3 border-b border-solid border-primaryColor/40 focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor"
            aria-readonly
          />
        </div>

        <div className="mb-5">
          <input
            type="password"
            value={newPassword}
            onChange={handleNewPasswordChange}
            name="newPassword"
            placeholder="New Password (leave blank to keep current)"
            className="w-full pr-4 py-3 border-b border-solid border-primaryColor/40 focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor"
          />
        </div>

        <div className="mb-5">
          <input
            type="text"
            value={formData.bloodType}
            onChange={handleInputChange}
            name="bloodType"
            placeholder="Blood Group"
            className="w-full pr-4 py-3 border-b border-solid border-primaryColor/40 focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor"
          />
        </div>

        <div className="mb-5 flex items-center justify-between">
          <label className="text-headingColor font-bold text-[16px] leading-7]">
            Gender:
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="text-textColor font-semibold text-[15px] leading-7 px-4 py-3 focus:outline-none"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
        </div>

        <div className="mb-5 flex items-center gap-3">
          {formData.photo && (
            <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center">
              <img
                src={formData.photo}
                alt={formData.name ? `${formData.name}'s profile preview` : 'Profile preview'}
                className="w-full rounded-full"
              />
            </figure>
          )}
          <div className="relative inline-block w-[130px] h-[50px]">
            <input
              className="custom-file-input absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              id="customFile"
              name="photo"
              type="file"
              accept=".jpg,.png,.jpeg"
              onChange={handleFileInputChange}
            />

            <label
              className="custom-file-label absolute top-0 left-0 w-full h-full flex items-center px-[0.75rem] py-[0.375rem] text-[15px] leading-6 overflow-hidden bg-primaryColor/30 text-headingColor font-semibold rounded-lg truncate cursor-pointer hover:bg-primaryColor/40 transition-colors duration-200 justify-center"
              htmlFor="customFile"
            >
              {formData.photo ? "Change Photo" : "Upload Photo"}
            </label>
          </div>
        </div>

        <div className="mt-7">
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
