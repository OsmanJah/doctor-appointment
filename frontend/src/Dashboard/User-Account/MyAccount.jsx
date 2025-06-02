import { useContext, useState } from "react";
// import userProfile from "../../assets/images/doctor-img01.png";
import Profile from "./Profile";
import MyBookings from "./MyBookings";
import { BASE_URL } from "./../../config";

import useGetProfile from "../../hooks/useFetchData";
import HashLoader from "react-spinners/HashLoader";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const MyAccount = () => {
  const [tab, setTab] = useState("bookings");
  const {
    data: userData,
    loading,
    error,
    refetch,
  } = useGetProfile(`${BASE_URL}/users/profile/me`);

  const { dispatch } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  return (
    <section>
      <div className="max-w-[1170px] px-5 mx-auto">
        {loading && (
          <div className="flex items-center justify-center w-full h-full">
            <HashLoader color="#4FD1C5" />
          </div>
        )}
        {error && !loading && (
          <div className="flex items-center justify-center w-full h-full">
            <h3 className="text-headingColor text-[20px] font-semibold leading-[30px]">
              {error}
            </h3>
          </div>
        )}

        {!loading && !error && (
          <div className="grid md:grid-cols-3 gap-10 ">
            <div className=" px-[30px] pb-[50px] rounded-md  ">
              <div className="flex items-center justify-center">
                <figure className="w-[100px] h-[100px] rounded-full border-2 border-solid border-primaryColor">
                  <img
                    src={userData?.photo}
                    alt={userData?.name || 'User profile picture'}
                    className="w-full rounded-full"
                  />
                </figure>
              </div>

              <div className="text-center mt-4">
                <h3 className="text-[18px] leading-[30px] text-headingColor font-bold">
                  {userData?.name}
                </h3>
                <p className="text-textColor text-[15px] leading-6 font-medium">
                  {userData?.email}
                </p>

                <p className="text-textColor text-[15px] leading-6 font-medium">
                  Blood Type:
                  <span className="ml-2 text-headingColor text-[22px] leading-8">
                    {userData?.bloodType}
                  </span>
                </p>
              </div>

              <div className="mt-[50px] md:mt-[100px]">
                <button
                  onClick={handleLogout}
                  className="btn w-full bg-red-600 hover:bg-red-700 text-[16px] leading-7 rounded-md"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="md:col-span-2 md:px-[30px]">
              <div>
                <button
                  onClick={() => setTab("bookings")}
                  className={`
                    ${tab === "bookings"
                      ? "bg-primaryColor text-white font-normal"
                      : "text-headingColor border-primaryColor hover:bg-primaryColorHover hover:text-white"
                    }  
                    p-2 mr-5 px-5 rounded-md font-semibold text-[16px] leading-7 border border-solid transition-all duration-300
                  `}
                >
                  My Bookings
                </button>
                <button
                  onClick={() => setTab("settings")}
                  className={`
                    ${tab === "settings"
                      ? "bg-primaryColor text-white font-normal"
                      : "text-headingColor border-primaryColor hover:bg-primaryColorHover hover:text-white"
                    } 
                    py-2 px-5 rounded-md font-semibold text-headingColor text-[16px] leading-7 border border-solid transition-all duration-300
                  `}
                >
                  Settings
                </button>
              </div>

              <div className="mt-[50px]">
                {tab === "bookings" && (
                  <div>
                    <h2 className="heading text-[30px]">My bookings</h2>
                    <MyBookings />
                  </div>
                )}
                {tab === "settings" && (
                  <div>
                    <h2 className="heading text-[30px]">Profile Settings</h2>
                    <Profile userData={userData} refetchUserData={refetch} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyAccount;
