import express from "express";
import { 
  getAllMedicines,
  getSingleMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine
} from "../controllers/medicineController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";

const router = express.Router();

// Public routes
router.get("/", getAllMedicines);
router.get("/:id", getSingleMedicine); // Route to get a single medicine by ID

// Admin routes
router.post("/", authenticate, restrict(["admin"]), createMedicine);
router.put("/:id", authenticate, restrict(["admin"]), updateMedicine);
router.delete("/:id", authenticate, restrict(["admin"]), deleteMedicine);

export default router; 