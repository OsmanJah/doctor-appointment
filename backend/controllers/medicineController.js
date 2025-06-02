
const staticMedicines = [
  {
    _id: "static001",
    name: "Paracetamol 500mg",
    description: "Effective relief from pain and fever. Suitable for adults and children over 12.",
    price: 1500,
    category: "Pain Relief",
  },
  {
    _id: "static002",
    name: "Ibuprofen 200mg",
    description: "Anti-inflammatory pain relief for headaches, muscle aches, and dental pain.",
    price: 2200,
    category: "Pain Relief",
  },
  {
    _id: "static003",
    name: "Vitamin C 1000mg",
    description: "Supports immune system health. Effervescent tablets.",
    price: 2950,
    category: "Vitamins & Supplements",
  },
  {
    _id: "static004",
    name: "Loratadine 10mg",
    description: "Non-drowsy antihistamine for allergy relief.",
    price: 1800,
    category: "Antihistamines",
  },
  {
    _id: "static005",
    name: "Amoxicillin 500mg",
    description: "Antibiotic used to treat bacterial infections.",
    price: 3500,
    category: "Antibiotics",
  },
  {
    _id: "static006",
    name: "Omeprazole 20mg",
    description: "Reduces stomach acid production for treatment of heartburn and ulcers.",
    price: 2800,
    category: "Digestive Health",
  },
  {
    _id: "static007",
    name: "Multivitamin Complex",
    description: "Daily supplement with essential vitamins and minerals.",
    price: 3900,
    category: "Vitamins & Supplements",
  },
  {
    _id: "static008",
    name: "Cetirizine 10mg",
    description: "Relieves allergy symptoms including sneezing and itchy eyes.",
    price: 1600,
    category: "Antihistamines",
  },
  {
    _id: "static009",
    name: "Metformin 500mg",
    description: "Oral medication to control blood sugar levels in type 2 diabetes.",
    price: 2100,
    category: "Diabetes Care",
  },
  {
    _id: "static010",
    name: "Aspirin 100mg",
    description: "Low-dose aspirin for prevention of heart attacks and strokes.",
    price: 1250,
    category: "Heart Health",
  },
  {
    _id: "static011",
    name: "Zinc Supplement",
    description: "Supports immune function and wound healing.",
    price: 2400,
    category: "Vitamins & Supplements",
  },
  {
    _id: "static012",
    name: "Diclofenac Gel 1%",
    description: "Topical gel for localized pain relief in muscles and joints.",
    price: 3200,
    category: "Pain Relief",
  }
];

// Get all medicines
export const getAllMedicines = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Medicines retrieved successfully",
      data: staticMedicines, 
    });
  } catch (error) {
    console.error("Error in getAllMedicines (static):", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve medicines. Please try again later.",
    });
  }
};

// Get single medicine by ID (publicly accessible)
export const getSingleMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const medicine = await Medicine.findById(id);
    if (!medicine) return res.status(404).json({ success: false, message: "Medicine not found." });
    res.status(200).json({ success: true, message: "Medicine retrieved successfully", data: medicine });
  } catch (error) {
    console.error("Error fetching single medicine:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve medicine." });
  }
};

export const createMedicine = async (req, res) => {
  try {
    const { name, description, category, price, stock } = req.body;
    if (!name || !description || !price || stock === undefined || stock === null) {
        return res.status(400).json({ success: false, message: "Missing required fields (name, description, price, stock)." });
    }
    const newMedicine = new Medicine({ name, description, category, price, stock });
    await newMedicine.save();
    res.status(201).json({ success: true, message: "Medicine created successfully!", data: newMedicine });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: `Medicine with name '${error.keyValue.name}' already exists.` });
    console.error("Error creating medicine:", error);
    res.status(500).json({ success: false, message: "Failed to create medicine." });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category, photo } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock, 10);
    if (category !== undefined) updateData.category = category;
    if (photo !== undefined) updateData.photo = photo; // Allow photo to be updated or cleared

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ success: false, message: "No update data provided." });
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    if (!updatedMedicine) return res.status(404).json({ success: false, message: "Medicine not found." });
    res.status(200).json({ success: true, message: "Medicine updated successfully!", data: updatedMedicine });
  } catch (error) {
    if (error.code === 11000) { // Handle duplicate key error for name
        return res.status(400).json({ success: false, message: `Medicine with name '${error.keyValue.name}' already exists.` });
    }
    console.error("Error updating medicine:", error);
    if (error.name === 'ValidationError') {
        let errors = {};
        Object.keys(error.errors).forEach((key) => {
            errors[key] = error.errors[key].message;
        });
        return res.status(400).json({ success: false, message: "Validation Error", errors });
    }
    res.status(500).json({ success: false, message: "Failed to update medicine." });
  }
};

// Delete medicine by ID (Admin only)
export const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMedicine = await Medicine.findByIdAndDelete(id);
    if (!deletedMedicine) return res.status(404).json({ success: false, message: "Medicine not found." });
    res.status(200).json({ success: true, message: "Medicine deleted successfully!", data: deletedMedicine });
  } catch (error) {
    console.error("Error deleting medicine:", error);
    res.status(500).json({ success: false, message: "Failed to delete medicine." });
  }
}; 