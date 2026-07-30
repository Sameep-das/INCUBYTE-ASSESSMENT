import { Router } from "express";
import { signUpController, logInController, logOutController, refreshTokenController } from "@/controllers/auth.controller.js";
import validateSchema from "@/middlewares/validation.middleware.js";
import { userLogInSchema, userSignUpSchema } from "@/types/auth.types.js";
import { authenticate } from "@/middlewares/authenticate.middleware.js";
import csrfProtection from "@/middlewares/csrfProtection.middleware.js";
// import adminRouter from "./admin.route.js";

const authRouter = Router();

authRouter.post("/register", validateSchema(userSignUpSchema), signUpController);
authRouter.post("/login", validateSchema(userLogInSchema), logInController);
authRouter.post("/logout", authenticate, csrfProtection, logOutController);
authRouter.post("/refresh", csrfProtection, refreshTokenController);

// Registers administrative endpoints under /auth/admin for authentication and crawler management.
// authRouter.use("/admin", adminRouter);

export default authRouter;