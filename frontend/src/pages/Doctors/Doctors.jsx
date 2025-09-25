import { useEffect, useState } from "react";
import DoctorCard from "../../components/Doctors/DoctorCard";
import { BASE_URL } from "../../config";
import useFetchData from "../../hooks/useFetchData";
import HashLoader from "react-spinners/HashLoader";

const Doctors = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const {
    data: doctors,
    loading,
    error,
  } = useFetchData(`${BASE_URL}/doctors?query=${debouncedQuery}`);
  const quickFilters = ["General Medicine", "Dermatology", "Pediatrics", "Cardiology"];

  const handleSearch = () => {
    setQuery(query.trim());
  };

  useEffect(() => {
    // Debounce the query value after 500ms of inactivity
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
    }, 700);

    // Clean up the timeout
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <>
      <section className="bg-secondaryColor">
        <div className="container text-center">
          <h2 className="heading heading--accent">Find a Doctor</h2>
          <p className="text__para text-center max-w-[540px] mx-auto">
            Browse verified specialists, compare expertise, and lock in an appointment that fits your schedule.
          </p>
          <div className="max-w-[640px] mx-auto mt-8 surface-glass p-3 md:p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 bg-white/70 rounded-[14px] border border-primaryColor/20 px-3 py-1 focus-within:border-primaryColor/50 transition">
              <input
                className="flex-1 bg-transparent py-3 md:py-4 pl-2 pr-2 focus:outline-none cursor-text text-[16px] placeholder:text-textColor/70"
                type="search"
                placeholder="Search by doctor name or specialization"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button
                className="btn btn--sm mt-0"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {quickFilters.map(filter => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setQuery(filter)}
                  className="px-4 py-2 rounded-full border border-primaryColor/20 text-sm text-headingColor/90 bg-white/70 hover:bg-primaryColor/10 transition"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {doctors?.length > 0 ? (
                doctors.map(doctor => (
                  <DoctorCard doctor={doctor} key={doctor._id} />
                ))
              ) : (
                <p className="text-center text-textColor text-lg col-span-full">
                  No doctors found matching your criteria.
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Doctors;
