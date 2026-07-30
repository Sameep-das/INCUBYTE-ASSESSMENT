import { Router } from "express";
import * as usersController from "@/controllers/users.controller.js";
import { authenticate } from "@/middlewares/authenticate.middleware.js";

const usersRouter = Router();

usersRouter.get("/cars/filters", usersController.getCarFilterOptions);
usersRouter.get("/cars", usersController.getAllCars);
usersRouter.get("/cars/:id", usersController.getCarById);
usersRouter.post("/cars/:id/purchase", authenticate, usersController.purchaseCar);

export default usersRouter;
