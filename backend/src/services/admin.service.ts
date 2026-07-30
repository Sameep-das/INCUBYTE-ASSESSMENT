import bcrypt from "bcrypt";
import env from "@/config/env.config.js";
import { InvalidCredentialsError } from "@/errors/auth.errors.js";
import { generateToken } from "@/utils/jwt.utils.js";

export const loginAdmin = async (name: string, email: string, password: string) => {

    if (name !== env.ADMIN_NAME) {
        throw new InvalidCredentialsError("Invalid credentials", 401);
    }

    if (email !== env.ADMIN_EMAIL) {
        throw new InvalidCredentialsError("Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);
    if (!isMatch) {
        throw new InvalidCredentialsError("Invalid credentials", 401);
    }

    const accessToken = generateToken({ userName: name, userEmail: email }, env.JWT_SECRET_ACCESS_TOKEN, "15m");
    const refreshToken = generateToken({ userName: name, userEmail: email }, env.JWT_SECRET_REFRESH_TOKEN, "7d");

    return { accessToken, refreshToken };
};
