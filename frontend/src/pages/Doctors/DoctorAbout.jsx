/* eslint-disable react/prop-types */
const DoctorAbout = ({ name, about, qualifications, experiences }) => {

  return (
    <div className="w-full">
      <div className="mt-8 w-full">
        <h3 className="text-[20px] leading-[30px] text-headingColor font-semibold flex items-center w-full">
          About <span className="text-primaryColor font-bold text-[24px] leading-9 ml-2">{name}</span>
        </h3>
        <p className="text__para">{about ? about : "No detailed about information provided."}</p>
      </div>


      {(qualifications?.length > 0) && (
        <div className="mt-12">
          <h3 className="text-[20px] leading-[30px] text-headingColor font-semibold">
            Qualifications
          </h3>
          <ul className="pt-4 md:p-5">
            {qualifications.map((item, index) => (
              <li key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-end md:gap-5 mb-[30px]">
                <div>
                  <span className="text-primaryColor text-[15px] leading-6 font-semibold">
                    {item.degree}
                  </span>
                  <p className="text-[14px] leading-6 font-medium text-textColor">
                    {item.university}
                  </p>
                </div>
                <p className="text-[14px] leading-5 font-medium text-textColor">
                  {item.year ? item.year : 'Year N/A'}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}


      {(experiences?.length > 0) && (
        <div className="mt-12">
          <h3 className="text-[20px] leading-[30px] text-headingColor font-semibold">
            Experience
          </h3>
          <ul className="grid sm:grid-cols-1 gap-[30px] pt-4 md:p-5">
            {experiences.map((item, index) => (
              <li key={index} className="p-4 rounded-lg bg-primaryColor/10 border border-primaryColor/15">
                <span className="text-primaryColor text-[15px] leading-6 font-semibold">
                  {item.position}
                </span>
                <p className="text-[14px] leading-6 font-medium text-textColor">
                  {item.hospital}
                </p>
                <p className="text-[14px] leading-5 font-medium text-textColor">
                  {item.duration ? item.duration : 'Duration N/A'}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DoctorAbout;
