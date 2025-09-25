import { useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { BiMenu } from "react-icons/bi";

// eslint-disable-next-line react/prop-types
const Tabs = ({ tab, setTab }) => {
  const { dispatch } = useContext(AuthContext);
  const tabsRef = useRef(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  const toggleTabs = () => tabsRef.current.classList.toggle("hidden");

  return (
    <div>
      <span className="lg:hidden" onClick={toggleTabs}>
        <BiMenu className="w-6 h-6 cursor-pointer" />
      </span>
      <div
        ref={tabsRef}
        className="hidden lg:flex items-center shadow-panelShadow  h-max p-[30px] bg-white  flex-col rounded-md"
      >
        <button
          onClick={() => setTab("overview")}
          className={`
            w-full btn rounded-md mt-0 
            ${tab === "overview"
              ? "bg-primaryColor text-white"
              : "bg-transparent text-headingColor border border-primaryColor hover:bg-primaryColorHover hover:text-white transition-all duration-300"
            }
          `}
        >
          Overview
        </button>
        <button
          onClick={() => setTab("appointments")}
          className={`
            w-full btn rounded-md mt-0 
            ${tab === "appointments"
              ? "bg-primaryColor text-white"
              : "bg-transparent text-headingColor border border-primaryColor hover:bg-primaryColorHover hover:text-white transition-all duration-300"
            }
          `}
        >
          Appointments
        </button>

        <button
          onClick={() => setTab("calendar")}
          className={`
            w-full btn rounded-md mt-0 
            ${tab === "calendar"
              ? "bg-primaryColor text-white"
              : "bg-transparent text-headingColor border border-primaryColor hover:bg-primaryColorHover hover:text-white transition-all duration-300"
            }
          `}
        >
          Calendar
        </button>

        <button
          onClick={() => setTab("analytics")}
          className={`
            w-full btn rounded-md mt-0 
            ${tab === "analytics"
              ? "bg-primaryColor text-white"
              : "bg-transparent text-headingColor border border-primaryColor hover:bg-primaryColorHover hover:text-white transition-all duration-300"
            }
          `}
        >
          Booking Analytics
        </button>

        <button
          onClick={() => setTab("settings")}
          className={`
            w-full btn rounded-md mt-0 
            ${tab === "settings"
              ? "bg-primaryColor text-white"
              : "bg-transparent text-headingColor border border-primaryColor hover:bg-primaryColorHover hover:text-white transition-all duration-300"
            }
          `}
        >
          Profile
        </button>

        <div className="mt-[50px] w-full">
          <button
            onClick={handleLogout}
            className="btn--outline w-full text-[16px] leading-7 rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tabs;
