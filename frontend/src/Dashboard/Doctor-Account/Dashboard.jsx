import { useState, useContext } from "react";
// import doctorImg from "../../assets/images/doctor-img02.png";
import starIcon from "../../assets/images/Star.png";
import DoctorAbout from "../../pages/Doctors/DoctorAbout";
import useFetchData from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import Profile from "./Profile";
import Tabs from "./Tabs";
import HashLoader from "react-spinners/HashLoader";
import Appointments from "./Appointments";
import DoctorFeedback from "../../pages/Doctors/DoctorFeedback";
import { AuthContext } from "../../context/AuthContext.jsx";
import { toast } from "react-toastify";
import DoctorCalendar from "./DoctorCalendar";
import DoctorAnalytics from "./DoctorAnalytics";

const Dashboard = () => {
  const [tab, setTab] = useState("overview");
  const { role } = useContext(AuthContext);

  // Fetch Doctor Profile Data
  const { data: doctorData, loading: loadingProfile, error: errorProfile, refetch: refetchDoctorProfile } = 
    useFetchData(`${BASE_URL}/doctors/profile/me`);

  // Fetch Doctor Appointments Data
  const { data: appointmentData, loading: loadingAppointments, error: errorAppointments, refetch: refetchAppointments } = 
    useFetchData(`${BASE_URL}/doctors/profile/appointments`);

  // Combine loading states
  const loading = loadingProfile || loadingAppointments;
  // Combine or prioritize errors if necessary
  const error = errorProfile || errorAppointments;

  return (
    <section>
      <div className="max-w-[1170px] px-5 mx-auto">
        {loading && (
          <div className="flex items-center justify-center w-full h-full">
            <HashLoader color="#4FD1C5" />
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center w-full h-full">
            <h3 className="text-headingColor text-[20px] font-semibold leading-[30px]">
              {error?.message || 'Something went wrong'}
            </h3>
          </div>
        )}

        {!loading && !error && doctorData && (
          <div className="grid lg:grid-cols-3 gap-[30px] lg:gap-[50px] ">
            <Tabs tab={tab} setTab={setTab} />
            <div className="lg:col-span-2">
              <div className="mt-8">
                {tab === "overview" && (
                  <div>

                    <div className="flex flex-col md:flex-row gap-6 mb-20">
                      <figure className="w-[200px] h-[200px] flex-shrink-0 relative mb-4 md:mb-0">
                        <img src={doctorData?.photo} alt={doctorData?.name || 'Doctor profile photo'} className="w-full object-cover" />
                      </figure>
                      <div className="flex-1">
                        <span className="bg-primaryColor text-white py-1 px-4 lg:py-2 lg:px-6 rounded text-[12px] leading-4 lg:text-[16px] lg:leading-7 font-[600]">
                          {doctorData?.specialization}
                        </span>
                        <h3 className="text-headingColor text-[22px] leading-[36px] mt-3 font-bold">
                          {doctorData?.name}
                        </h3>
                        <p className="text__para text-[15px] leading-6 lg:max-w-[390px]">
                          {doctorData?.bio}
                        </p>
                        {doctorData?.locations?.length > 0 && (
                          <p className="text__para text-[15px] leading-6 lg:max-w-[390px] mt-2">
                            <span className="font-semibold text-primaryColor">Location:&nbsp;</span>
                            {doctorData.locations.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    

                    <div className="mt-10 pt-5 border-t border-solid border-primaryColor/20">
                      <DoctorAbout
                        name={doctorData?.name}
                        about={doctorData?.about}
                        qualifications={doctorData?.qualifications}
                        experiences={doctorData?.experiences}
                      />
                    </div>

                    {/* Reviews Section */}
                    {doctorData?.reviews && (
                      <div className="mt-10 pt-5 border-t border-solid border-primaryColor/20">
                        <DoctorFeedback
                          reviews={doctorData.reviews}
                          totalRating={doctorData.totalRating}
                          averageRating={doctorData.averageRating}
                          doctorId={doctorData._id}
                          refetchDoctorData={refetchDoctorProfile}
                          canGiveFeedback={false}
                        />
                      </div>
                    )}
                  </div>
                )}
                {tab === "settings" && <Profile doctorData={doctorData} refetchDoctorData={refetchDoctorProfile} />}
                {tab === "appointments" && (
                  <Appointments 
                    appointments={appointmentData} 
                    refetchAppointments={refetchAppointments}
                  />
                )}
                {tab === "calendar" && (
                  <DoctorCalendar appointments={appointmentData} />
                )}
                {tab === "analytics" && (
                  <DoctorAnalytics appointments={appointmentData} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
