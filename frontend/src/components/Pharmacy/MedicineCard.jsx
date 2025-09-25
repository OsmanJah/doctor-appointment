/* eslint-disable react/prop-types */
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { BsCapsule } from "react-icons/bs";

const MedicineCard = ({ medicine }) => {
  const { name, price, description, _id: medicineId } = medicine;
  const { addItem } = useContext(CartContext);
  const { user, role } = useContext(AuthContext);
  const navigate = useNavigate();

  const isOutOfStock = false;

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }
    
    if (role !== "patient") {
      toast.error("Only patients can add items to the cart.");
      return;
    }

    addItem({
      medicineId,
      name,
      price,
      description,
      quantity: 1,
    });
    toast.success(`${name} added to cart!`);
  };

  const formattedPrice = price ? `${(price || 0).toLocaleString("hu-HU")} HUF` : "Contact for price";
  const summary = description
    ? `${description.substring(0, 110)}${description.length > 110 ? "…" : ""}`
    : "No description available.";

  return (
    <article className="card h-full flex flex-col">
      <div className="card__body flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primaryColor/70">
              <BsCapsule /> Featured Formula
            </span>
            <h3 className="text-xl font-semibold text-headingColor mt-2" title={name}>
              {name}
            </h3>
          </div>
          <span className="pill bg-primaryColor/10 text-primaryColor border-primaryColor/20">
            {formattedPrice}
          </span>
        </div>

        <p className="text-sm text-textColor/90 leading-6 mt-3 flex-1">
          {summary}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-xs text-textColor/70">
            Eligible for patient dashboard refills
          </span>
          <button
            className="btn btn--sm mt-0"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
};

export default MedicineCard;
