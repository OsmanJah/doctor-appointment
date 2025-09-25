import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import signupImg from "../assets/images/signup.gif";
import { BASE_URL } from "../config";
import { toast } from "react-toastify";
import uploadImageToCloudinary from "../utils/uploadCloudinary";
import HashLoader from "react-spinners/HashLoader";
import { BsCheckCircleFill } from "react-icons/bs";

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

  const perks = [
    "Personalized care plans",
    "Verified medical experts",
    "Automated visit reminders",
  ];

  return (
    <section className="section--alt px-5 xl:px-0">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-14 items-center">
        <div className="hidden lg:flex flex-col gap-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-brand-diagonal-soft opacity-80 blur-2xl" />
            <figure className="relative rounded-3xl overflow-hidden shadow-glowSoft border border-white/40">
              <img className="w-full h-full object-cover" src={signupImg} alt="Welcome to MarieCare" />
            </figure>
          </div>
          <div className="surface-glass p-8 rounded-3xl shadow-panelShadow border border-white/40">
            <span className="section__eyebrow">Why people choose MarieCare</span>
            <h3 className="heading heading--accent text-[30px] leading-[40px]">
              Premium experiences crafted with care
            </h3>
            <ul className="mt-6 space-y-4">
              {perks.map(perk => (
                <li key={perk} className="flex items-start gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primaryColor/15 text-primaryColor">
                    <BsCheckCircleFill className="text-base" />
                  </span>
                  <span className="text-headingColor/90 font-semibold text-[15px] leading-6">
                    {perk}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="surface-glass rounded-3xl shadow-panelShadow border border-white/50 lg:pl-14 py-10 px-6 lg:px-10">
          <h3 className="text-headingColor text-[30px] leading-[40px] font-bold mb-6 text-center lg:text-left">
            Create an <span className="text-primaryColor">Account</span>
          </h3>
          <p className="text-sm text-textColor/80 mb-8 text-center lg:text-left">
            Sign up in minutes to start booking appointments, managing prescriptions, and messaging clinicians securely.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="form__label">Full name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="form__input"
                required
              />
            </div>

            <div>
              <label className="form__label">Email address</label>
              <input
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                name="email"
                placeholder="Enter Your Email"
                className="form__input"
                required
              />
            </div>

            <div>
              <label className="form__label">Create password</label>
              <input
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                name="password"
                placeholder="Password"
                className="form__input"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form__label" htmlFor="signup-role">Are you a:</label>
                <select
                  id="signup-role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="form__input"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>

              <div>
                <label className="form__label" htmlFor="signup-gender">Gender</label>
                <select
                  id="signup-gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="form__input"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {previewUrl && (
                <figure className="w-[70px] h-[70px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </figure>
              )}
              <div className="relative inline-flex items-center">
                <input
                  className="custom-file-input absolute inset-0 opacity-0 cursor-pointer"
                  id="customFile"
                  name="photo"
                  type="file"
                  accept=".jpg,.png,.jpeg"
                  onChange={handleFileInputChange}
                />
                <label
                  className="custom-file-label btn--ghost"
                  htmlFor="customFile"
                >
                  Upload Photo
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn w-full text-[18px] leading-[30px]"
              >
                {loading ? <HashLoader size={25} color="#fff" /> : "Sign Up"}
              </button>
            </div>

            <p className="text-textColor text-center text-sm">
              Already have an account?
              <Link to="/login" className="text-primaryColor font-semibold ml-1 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
