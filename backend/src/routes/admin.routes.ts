import { Router } from "express";
import * as adminController from "@/controllers/admin.controller.js";
import * as statsController from "@/controllers/stats.controller.js";
import { authenticateAdmin } from "@/middlewares/authenticateAdmin.middleware.js";
import { validateCreateCar, validateUpdateCar, validateRestock } from "@/middlewares/adminValidation.middleware.js";

const adminRouter = Router();

// Auth routes
adminRouter.post("/login", adminController.loginAdmin);
adminRouter.post("/logout", authenticateAdmin, adminController.logoutAdmin);

// Car management routes
adminRouter.get("/cars", authenticateAdmin, adminController.getAllCars);
adminRouter.get("/cars/:id", authenticateAdmin, adminController.getCarById);
adminRouter.post("/cars", authenticateAdmin, validateCreateCar, adminController.createCar);
adminRouter.put("/cars/:id", authenticateAdmin, validateUpdateCar, adminController.updateCar);
adminRouter.delete("/cars/:id", authenticateAdmin, adminController.deleteCar);
adminRouter.post("/cars/:id/restock", authenticateAdmin, validateRestock, adminController.restockCar);

// Dashboard statistics
adminRouter.get("/stats/dashboard", authenticateAdmin, statsController.getDashboardStats);
adminRouter.get("/stats/sales-by-make", authenticateAdmin, statsController.getSalesByMake);
adminRouter.get("/stats/top-models", authenticateAdmin, statsController.getTopCarModels);

export default adminRouter;
