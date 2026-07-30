import bcrypt from "bcrypt";
import env from "@/config/env.config.js";
import { InvalidCredentialsError } from "@/errors/auth.errors.js";
import { generateToken } from "@/utils/jwt.utils.js";

export const loginAdmin = async (email: string, password: string) => {
    if (email !== env.ADMIN_EMAIL) {
        throw new InvalidCredentialsError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);
    if (!isMatch) {
        throw new InvalidCredentialsError("Invalid email or password", 401);
    }

    const accessToken = generateToken({ userName: env.ADMIN_NAME, userEmail: email }, env.JWT_SECRET_ACCESS_TOKEN, "15m");
    const refreshToken = generateToken({ userName: env.ADMIN_NAME, userEmail: email }, env.JWT_SECRET_REFRESH_TOKEN, "7d");

    return { accessToken, refreshToken };
};
