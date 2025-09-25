import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import signupImg from "../assets/images/signup.gif";
import { BASE_URL } from "../config";
import { toast } from "react-toastify";
import uploadImageToCloudinary from "../utils/uploadCloudinary";
import HashLoader from "react-spinners/HashLoader";

const SignUp = () => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "male",
    role: "patient",
    photo: null,
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileInputChange = async event => {
    const file = event.target.files[0];
    if (file) {
      try {
        setLoading(true); // Show loading indicator during upload
        const data = await uploadImageToCloudinary(file);
        setPreviewUrl(data.url);
        setFormData({ ...formData, photo: data.url });
        toast.success("Image uploaded successfully!");
      } catch (error) {
        toast.error(error.message || "Image upload failed. Please try again.");
        console.error("Image Upload Error:", error);
      } finally {
        setLoading(false); // Hide loading indicator when done
      }
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      // console.log("Submitting form data:", formData); // Commented out for production
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Registration failed");
      }

      setLoading(false);
      toast.success(result.message || "Registration successful!");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "An error occurred during registration.");
      setLoading(false);
    }
  };

  return (
    <section className="px-5 xl:px-0">
      <div className="max-w-[1170px] mx-auto ">
        <div className="grid grid-cols-1 lg:grid-cols-2 ">

          <div className="hidden lg:block bg-brand-diagonal animate-gradient-x rounded-l-lg" style={{backgroundSize:'200% 200%'}}>
            <figure className="rounded-l-lg">
              <img className="w-full rounded-l-lg" src={signupImg} alt="" />
            </figure>
          </div>

          <div className="rounded-l-lg lg:pl-16 py-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-panelShadow border border-slate-100 p-6">
            <h3 className="text-headingColor text-[22px] leading-9 font-bold mb-10">
              Create an <span className="text-primaryColor">Account</span>
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="w-full pr-4 py-3 border-b border-solid border-primaryColor/30 focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor"
                  required
                />
              </div>
              <div className="mb-5">
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  name="email"
                  placeholder="Enter Your Email"
                  className="w-full pr-4 py-3 border-b border-solid border-primaryColor/30 focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor"
                  required
                />
              </div>

              <div className="mb-5">
                <input
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  name="password"
                  placeholder="Password"
                  className="w-full pr-4 py-3 border-b border-solid border-primaryColor/30 focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor"
                  required
                />
              </div>

              <div className="mb-5 flex items-center justify-between">
                <label className="text-headingColor font-bold text-[16px] leading-7">
                  Are you a:
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="text-textColor font-semibold text-[15px] leading-7 px-4 py-3 focus:outline-none"
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </label>

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
                {previewUrl && (
                  <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
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
                    className="custom-file-label absolute top-0 left-0 w-full h-full flex items-center px-[0.75rem] py-[0.375rem] text-[15px] leading-6 overflow-hidden bg-primaryColor/10 text-headingColor font-semibold rounded-lg truncate cursor-pointer justify-center"
                    htmlFor="customFile"
                  >
                    Upload Photo
                  </label>
                </div>
              </div>

              <div className="mt-7">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primaryColor text-white py-3 px-4 rounded-lg text-[18px] leading-[30px] hover:bg-primaryColorHover transition-colors"
                >
                  {loading ? <HashLoader size={25} color="#fff" /> : "Sign Up"}
                </button>
              </div>

              <p className="mt-5 text-textColor text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-primaryColor font-medium hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
