/* eslint-disable react/prop-types */
import starIcon from "../../assets/images/Star.png";
import { Link } from "react-router-dom";
import { FaAngleRight } from 'react-icons/fa';

const DoctorCard = ({ doctor }) => {
  const {
    name,
    specialization,
    photo,
  } = doctor;

  return (
    <div className="p-3 lg:p-5 border border-gray-200 rounded-lg shadow-sm flex flex-col justify-between h-full">
      <div>
        <div>
          <img className="w-full h-48 object-cover rounded-t-lg" src={photo} alt={name} />
        </div>

        <h2 className="text-[18px] leading-[30px] lg:text-[22px] lg:leading-8 font-[700] text-headingColor mt-3 lg:mt-4">
          {name}
        </h2>

        <div className="mt-2 lg:mt-3 flex items-center justify-between">
          <span className="bg-primaryColor text-white py-1 px-3 lg:py-1.5 lg:px-4 rounded text-[12px] leading-4 lg:text-[14px] lg:leading-6 font-[600]">
            {specialization || 'Specialist'}
          </span>
        </div>
      </div>

      <div className="mt-4 lg:mt-5 flex items-center justify-end">
        <Link
          to={`/doctors/${doctor._id}`}
          className="w-[44px] h-[44px] rounded-full border border-solid border-[#181A1E] flex items-center justify-center group hover:bg-buttonBgColor hover:border-none"
        >
          <FaAngleRight className="group-hover:text-white w-6 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;
