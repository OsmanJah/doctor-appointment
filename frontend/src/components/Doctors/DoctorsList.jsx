import DoctorCard from "./DoctorCard.jsx";
import { BASE_URL } from "../../config.js";
import useFetchData from "../../hooks/useFetchData.js";
import HashLoader from "react-spinners/HashLoader.js";

const DoctorsList = () => {
  const { data: doctors, loading, error } = useFetchData(`${BASE_URL}/doctors`);
  return (
    <>
      {loading && (
        <div className="flex items-center justify-center w-full h-full">
          <HashLoader color="#14b8a6" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 lg:gap-[30px] mt-[30px] lg:mt-[55px]">
          {doctors?.map(doctor => (
            <DoctorCard doctor={doctor} key={doctor._id} />
          ))}
        </div>
      )}
    </>
  );
};

export default DoctorsList;
