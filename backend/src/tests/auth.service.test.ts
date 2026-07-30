import { beforeEach, describe, expect, it, vi } from "vitest";
import SignUpDTO from "@/dtos/SignUpDTO.js";
import LoginDTO from "@/dtos/LogInDTO.js";
import { AuthenticationError } from "@/errors/auth.errors.js";

vi.mock("@/repositories/user.repository.js", () => ({
    createUser: vi.fn(),
    findByEmail: vi.fn(),
    rotateRefreshToken: vi.fn(),
    deleteRefreshToken: vi.fn(),
    getRefreshToken: vi.fn(),
    getUserId: vi.fn(),
    addRefreshToken: vi.fn(),
}));

vi.mock("@/utils/bcrypt.utils.js", () => ({
    hash: vi.fn(),
    compare: vi.fn(),
}));

vi.mock("@/utils/jwt.utils.js", () => ({
    generateToken: vi.fn(),
    verifyToken: vi.fn(),
}));

import * as authService from "@/services/auth.service.js";
import * as userRepo from "@/repositories/user.repository.js";
import * as bcryptUtils from "@/utils/bcrypt.utils.js";
import * as jwtUtils from "@/utils/jwt.utils.js";

const mockedUserRepo = vi.mocked(userRepo);
const mockedBcrypt = vi.mocked(bcryptUtils);
const mockedJwt = vi.mocked(jwtUtils);

const user = {
    userId: "11111111-1111-1111-1111-111111111111",
    userName: "jane",
    userEmail: "jane@example.com",
    passwordHash: "password-hash",
    userContact: null,
    city: "Delhi",
    pinCode: "110001",
    state: "Delhi",
    houseNumber: null,
    createdAt: null,
};

const signupPayload = {
    username: "jane",
    email: "jane@example.com",
    password: "Password@123",
    city: "Delhi",
    pinCode: "110001",
    state: "Delhi",
    houseNumber: "12",
    phone: "9876543210",
};

describe("Auth Service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedJwt.generateToken.mockReturnValueOnce("access-token").mockReturnValueOnce("refresh-token");
    });

    it("signs up a new user and stores a hashed refresh token", async () => {
        mockedUserRepo.findByEmail.mockResolvedValue(undefined);
        mockedBcrypt.hash.mockResolvedValueOnce("password-hash").mockResolvedValueOnce("refresh-hash");
        mockedUserRepo.createUser.mockResolvedValue(user);

        const result = await authService.signUpService(new SignUpDTO(signupPayload));

        expect(result).toEqual({
            user,
            accessToken: "access-token",
            refreshToken: "refresh-token",
        });
        expect(mockedUserRepo.createUser).toHaveBeenCalledWith(
            expect.objectContaining({
                userName: "jane",
                userEmail: "jane@example.com",
                passwordHash: "password-hash",
                city: "Delhi",
                state: "Delhi",
                pinCode: "110001",
                houseNumber: "12",
            }),
            expect.objectContaining({ refreshToken: "refresh-hash" }),
        );
    });

    it("rejects duplicate users during signup", async () => {
        mockedUserRepo.findByEmail.mockResolvedValue(user);

        await expect(authService.signUpService(new SignUpDTO(signupPayload)))
            .rejects.toMatchObject({ name: "DuplicateUserError", message: "User already exists" });
    });

    it("logs in a user and rotates the stored refresh token", async () => {
        mockedUserRepo.findByEmail.mockResolvedValue(user);
        mockedBcrypt.compare.mockResolvedValue(true);
        mockedBcrypt.hash.mockResolvedValue("refresh-hash");
        mockedUserRepo.deleteRefreshToken.mockResolvedValue({ userId: user.userId });
        mockedUserRepo.addRefreshToken.mockResolvedValue({ userId: user.userId, refreshToken: "refresh-hash" });

        const result = await authService.logInService(new LoginDTO({
            email: user.userEmail,
            password: "Password@123",
        }));

        expect(result.user).toEqual({
            userId: user.userId,
            userName: user.userName,
            userEmail: user.userEmail,
        });
        expect(result.accessToken).toBe("access-token");
        expect(result.refreshToken).toBe("refresh-token");
    });

    it("rejects login failures from missing user, bad password, and refresh-token storage failures", async () => {
        mockedUserRepo.findByEmail.mockResolvedValueOnce(undefined);
        await expect(authService.logInService(new LoginDTO({ email: user.userEmail, password: "Password@123" })))
            .rejects.toMatchObject({ name: "InvalidCredentialsError" });

        mockedUserRepo.findByEmail.mockResolvedValue(user);
        mockedBcrypt.compare.mockResolvedValueOnce(false);
        await expect(authService.logInService(new LoginDTO({ email: user.userEmail, password: "Password@123" })))
            .rejects.toMatchObject({ name: "InvalidCredentialsError" });

        mockedBcrypt.compare.mockResolvedValue(true);
        mockedBcrypt.hash.mockResolvedValue("refresh-hash");
        mockedUserRepo.deleteRefreshToken.mockResolvedValueOnce(undefined);
        await expect(authService.logInService(new LoginDTO({ email: user.userEmail, password: "Password@123" })))
            .rejects.toBeInstanceOf(AuthenticationError);

        mockedUserRepo.deleteRefreshToken.mockResolvedValue({ userId: user.userId });
        mockedUserRepo.addRefreshToken.mockResolvedValueOnce(undefined);
        await expect(authService.logInService(new LoginDTO({ email: user.userEmail, password: "Password@123" })))
            .rejects.toBeInstanceOf(AuthenticationError);
    });

    it("logs out when the refresh token matches the stored hash", async () => {
        mockedJwt.verifyToken.mockReturnValue({ userName: user.userName, userEmail: user.userEmail });
        mockedUserRepo.getUserId.mockResolvedValue(user.userId);
        mockedUserRepo.getRefreshToken.mockResolvedValue({
            refreshToken: "refresh-hash",
            expiresAt: new Date(Date.now() + 1000),
        } as any);
        mockedBcrypt.compare.mockResolvedValue(true);
        mockedUserRepo.deleteRefreshToken.mockResolvedValue({ userId: user.userId });

        await expect(authService.logOutService(user.userEmail, "refresh-token")).resolves.toBe(true);
    });

    it("rejects logout requests with missing or invalid token state", async () => {
        await expect(authService.logOutService(undefined, "refresh-token"))
            .rejects.toMatchObject({ name: "AuthenticationError", message: "Missing required parameters for logout" });

        mockedJwt.verifyToken.mockReturnValueOnce({ userName: user.userName, userEmail: "other@example.com" });
        await expect(authService.logOutService(user.userEmail, "refresh-token"))
            .rejects.toMatchObject({ name: "AuthenticationError", message: "Token Mismatch" });

        mockedJwt.verifyToken.mockReturnValue({ userName: user.userName, userEmail: user.userEmail });
        mockedUserRepo.getUserId.mockResolvedValueOnce(undefined);
        await expect(authService.logOutService(user.userEmail, "refresh-token"))
            .rejects.toMatchObject({ name: "AuthenticationError", message: "User not found" });

        mockedUserRepo.getUserId.mockResolvedValue(user.userId);
        mockedUserRepo.getRefreshToken.mockResolvedValueOnce({
            refreshToken: "refresh-hash",
            expiresAt: new Date(Date.now() - 1000),
        } as any);
        await expect(authService.logOutService(user.userEmail, "refresh-token"))
            .rejects.toMatchObject({ name: "TokenExpiredError" });

        mockedUserRepo.getRefreshToken.mockResolvedValue({ refreshToken: "refresh-hash", expiresAt: new Date(Date.now() + 1000) } as any);
        mockedBcrypt.compare.mockResolvedValue(false);
        await expect(authService.logOutService(user.userEmail, "refresh-token"))
            .rejects.toMatchObject({ name: "AuthenticationError", message: "Invalid refresh token" });
    });

    it("refreshes access tokens through repository rotation", async () => {
        mockedJwt.verifyToken.mockReturnValue({ userName: user.userName, userEmail: user.userEmail });
        mockedUserRepo.rotateRefreshToken.mockImplementation(async (_email, callback) => {
            const data = await callback({
                userId: user.userId,
                refreshToken: "refresh-hash",
                expiresAt: new Date(Date.now() + 1000),
            } as any);
            return {
                userId: user.userId,
                ...data.response,
            };
        });
        mockedBcrypt.compare.mockResolvedValue(true);
        mockedBcrypt.hash.mockResolvedValue("new-refresh-hash");

        const result = await authService.refreshTokenRotationService("refresh-token");

        expect(result).toEqual({
            userId: user.userId,
            user: {
                userName: user.userName,
                userEmail: user.userEmail,
            },
            refreshToken: "refresh-token",
            accessToken: "access-token",
        });
    });

    it("rejects refresh-token rotation failures", async () => {
        await expect(authService.refreshTokenRotationService(undefined))
            .rejects.toMatchObject({ name: "AuthenticationError", message: "Refresh token is required" });

        mockedJwt.verifyToken.mockReturnValueOnce(undefined as any);
        await expect(authService.refreshTokenRotationService("refresh-token"))
            .rejects.toMatchObject({ name: "AuthenticationError", message: "Invalid refresh token" });

        mockedJwt.verifyToken.mockReturnValue({ userName: user.userName, userEmail: user.userEmail });
        mockedUserRepo.rotateRefreshToken.mockResolvedValue(null);
        await expect(authService.refreshTokenRotationService("refresh-token"))
            .rejects.toMatchObject({ name: "AuthenticationError", message: "Refresh token is invalid or has been revoked." });
    });
});
