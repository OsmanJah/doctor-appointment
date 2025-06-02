import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";

const MedicineCard = ({ medicine }) => {
  const { name, price, description, _id: medicineId } = medicine;
  const { addItem } = useContext(CartContext);
  const { user, role, token } = useContext(AuthContext);
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col p-5">
      <div className="flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-headingColor mb-2 truncate" title={name}>
          {name}
        </h3>
        <p className="text-sm text-textColor flex-grow mb-3">
          {description ? description.substring(0, 100) + (description.length > 100 ? "..." : "") : "No description available."}
        </p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-primaryColor">
            {price}
          </span>
        </div>
        <button
          className="w-full bg-primaryColor hover:bg-primaryDarkColor text-white text-[16px] leading-[24px] rounded-lg px-4 py-2.5 mt-auto transition-colors duration-200"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default MedicineCard;
