import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import HashLoader from "react-spinners/HashLoader";
import { BsCheckCircleFill } from "react-icons/bs";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const { dispatch } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message);
      }

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: result.data,
          token: result.token,
          role: result.role,
        },
      });

      setLoading(false);
      toast.success(result.message);
      navigate("/home");
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const highlights = [
    "Encrypted medical records",
    "Verified doctor network",
    "24/7 appointment management",
  ];

  return (
    <section className="section--alt px-5 md:px-0">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div className="surface-glass p-8 rounded-3xl shadow-panelShadow border border-white/40 hidden lg:block">
          <span className="section__eyebrow">Premium Care Access</span>
          <h2 className="heading heading--accent text-[36px] leading-[44px]">
            Manage your entire care journey in one dashboard.
          </h2>
          <p className="text__para">
            Rebook in seconds, message your care team, and stay on top of prescriptions with automated reminders.
          </p>
          <ul className="mt-8 space-y-4">
            {highlights.map(point => (
              <li key={point} className="flex items-start gap-3 text-headingColor font-semibold">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primaryColor/15 text-primaryColor">
                  <BsCheckCircleFill className="text-sm" />
                </span>
                <span className="text-[15px] leading-6 text-headingColor/90">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full max-w-[520px] mx-auto rounded-3xl surface-glass p-8 md:p-10 shadow-panelShadow border border-white/50">
          <h3 className="text-headingColor text-[26px] leading-[36px] font-bold mb-6 text-center">
            Access Your Account
          </h3>
          <p className="text-sm text-textColor/80 text-center mb-8">
            Welcome back! Enter your details to continue booking appointments and managing your care.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <label className="form__label">Password</label>
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

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn w-full text-[18px] leading-[30px]"
              >
                {loading ? <HashLoader size={25} color="#fff" /> : "Login"}
              </button>
            </div>

            <p className="text-textColor text-center text-sm">
              Don&apos;t have an account?
              <Link to="/register" className="text-primaryColor font-semibold ml-1">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
