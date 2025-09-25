/* eslint-disable react/prop-types */
import starIcon from "../../assets/images/Star.png";
import { Link } from "react-router-dom";
import { BsShieldCheck } from "react-icons/bs";
import { HiOutlineLocationMarker } from "react-icons/hi";

const DoctorCard = ({ doctor }) => {
  const {
    name,
    specialization,
    photo,
    averageRating,
    totalRating,
    bio,
    locations,
    ticketPrice,
    _id,
  } = doctor;

  const displayRating = typeof averageRating === "number" && averageRating > 0 ? averageRating.toFixed(1) : "New";
  const reviewsLabel = totalRating ? `${totalRating} review${totalRating === 1 ? "" : "s"}` : "Awaiting reviews";
  const primaryLocation = Array.isArray(locations) && locations.length > 0 ? locations[0] : null;
  const shortBio = bio?.length > 90 ? `${bio.slice(0, 87)}…` : bio;
  const isTopRated = typeof averageRating === "number" && averageRating >= 4.8 && (totalRating || 0) >= 10;
  const consultationLabel = ticketPrice ? `${ticketPrice.toLocaleString("hu-HU")} HUF` : "Flexible pricing";

  return (
    <article className="card h-full flex">
      <div className="card__body flex flex-col flex-1 p-3 lg:p-5 border border-gray-200 rounded-lg">
        <div className="relative overflow-hidden rounded-2xl">
          <img
            className="w-full h-56 object-cover rounded-2xl"
            src={photo}
            alt={name || "Doctor"}
            loading="lazy"
          />
          <span className="pill absolute top-4 left-4 bg-white/90 backdrop-blur text-primaryColor border-white/60">
            {specialization || "Specialist"}
          </span>
          <span className="doctor-card__badge">
            <img src={starIcon} alt="Star rating" className="w-4 h-4" />
            {displayRating}
          </span>
          {isTopRated && (
            <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-primaryColor text-white text-xs font-semibold py-2 px-3 shadow-glowSoft">
              <BsShieldCheck /> Trusted
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <h3 className="text-[20px] leading-[30px] lg:text-[22px] lg:leading-8 font-[800] text-headingColor">
            {name}
          </h3>

          <div className="flex items-center justify-between text-sm text-textColor/80">
            <span className="inline-flex items-center gap-2 font-semibold text-headingColor">
              <img src={starIcon} alt="Rating" className="w-4 h-4" />
              {displayRating}
            </span>
            <span>{reviewsLabel}</span>
          </div>

          {shortBio && (
            <p className="text-sm leading-6 text-textColor/90">
              {shortBio}
            </p>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-primaryColor font-semibold">{consultationLabel}</span>
            {primaryLocation && (
              <span className="doctor-card__location">
                <HiOutlineLocationMarker className="text-primaryColor" />
                {primaryLocation}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Link
            to={`/doctors/${_id}`}
            className="btn--ghost flex-1 group hover:bg-buttonBgColor hover:border-none"
          >
            View Profile
          </Link>
        </div>
      </div>
    </article>
  );
};

export default DoctorCard;
