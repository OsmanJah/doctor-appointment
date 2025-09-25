import { BASE_URL } from "../config";
import useFetchData from "../hooks/useFetchData";
import HashLoader from "react-spinners/HashLoader";
import MedicineCard from "../components/Pharmacy/MedicineCard";

const Pharmacy = () => {
  const { data: medicines, loading, error } = useFetchData(`${BASE_URL}/medicines`);

  return (
    <section className="section--alt">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <span className="section__eyebrow">Smart Pharmacy</span>
          <h2 className="heading heading--accent">Your curated treatment partner</h2>
          <p className="text__para mt-4">
            Shop clinician-approved medicines and wellness essentials, with transparent pricing and doorstep delivery options.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center mt-10">
            <HashLoader size={35} color="#14b8a6" />
          </div>
        )}

        {error && !loading && (
          <div className="text-center text-slate-600 mt-10">
            <p>Error loading medicines: {error}</p>
          </div>
        )}

        {!loading && !error && medicines && medicines.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
            {medicines.map((medicine) => (
              <MedicineCard key={medicine._id || medicine.medicineId} medicine={medicine} />
            ))}
          </div>
        )}

        {!loading && !error && (!medicines || medicines.length === 0) && (
          <div className="text-center text-textColor mt-10">
            <p>No medicines available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Pharmacy; 