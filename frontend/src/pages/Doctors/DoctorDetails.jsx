import { useState } from "react";
import starIcon from "../../assets/images/Star.png";
import DoctorAbout from "./DoctorAbout";
import SidePanel from "./SidePanel";
import { BASE_URL } from "../../config";
import useFetchData from "../../hooks/useFetchData";
import { useParams } from "react-router-dom";
import HashLoader from "react-spinners/HashLoader";

const DoctorDetails = () => {
  const [tab, setTab] = useState("about");
  const { id } = useParams();

  const {
    data: doctor,
    loading,
    error,
  } = useFetchData(`${BASE_URL}/doctors/${id}`);

  const {
    name,
    qualifications,
    experiences,
    timeSlots,
    bio,
    about,
    specialization,
    ticketPrice,
    photo,
    _id,
  } = doctor;

  return (
    <section>
      <div className="max-w-[1170px] px-[20px] mx-auto">
        {loading && (
          <div className="flex items-center justify-center w-full h-full">
            <HashLoader color="#0067FF" />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center w-full h-full">
            <h3 className="text-headingColor text-[20px] font-semibold leading-[30px]">
              {error}
            </h3>
          </div>
        )}

        {!loading && !error && (
          <div className="grid md:grid-cols-3 gap-[50px]">
            <div className="md:col-span-2">

              <div className="relative overflow-visible mb-16"> 
                <div className="flex flex-col md:flex-row gap-8 items-start">

                  <figure className="w-[200px] h-[200px] relative z-10 flex-shrink-0">
                    <img src={photo} alt={name || 'Doctor photo'} className="w-full object-cover" />
                  </figure>
                  

                  <div className="flex-1 mt-6 md:mt-0">
                    <span className="bg-primaryColor text-white py-1 px-4 lg:py-2 lg:px-6 rounded text-[12px] leading-4 lg:text-[16px] lg:leading-7 font-[600]">
                      {specialization}
                    </span>
                    <h3 className="text-headingColor text-[22px] leading-[36px] mt-3 font-bold">
                      {name}
                    </h3>
                    <p className="text__para text-[14px] md:text-[15px] leading-6 lg:max-w-[390px]">
                      {bio}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-[50px] border-b border-solid border-[#0066ff34]">
                <div>
                  <button
                    onClick={() => setTab("about")}
                    className={`${tab === "about" ? "border-b border-solid border-primaryColor" : ""} p-2 mr-5 px-5 text-headingColor font-semibold text-[16px] leading-7`}
                  >
                    About
                  </button>
                </div>
              </div>

              <div className="mt-[50px]">
                {tab === "about" && (
                  <div>
                    <DoctorAbout
                      name={name}
                      about={about}
                      qualifications={qualifications}
                      experiences={experiences}
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <SidePanel
                doctorId={_id}
                doctorName={name}
                ticketPrice={ticketPrice}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DoctorDetails;
