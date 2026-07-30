import type { Request, Response, NextFunction, RequestHandler } from "express";
import SignUpDTO from "@/dtos/SignUpDTO.js";
import LoginDTO from "@/dtos/LogInDTO.js";
import { signUpService, logInService, logOutService, refreshTokenRotationService } from "@/services/auth.service.js";
import asyncHandler from "@/utils/asyncHandler.js";
import { getRefreshTokenFromCookies, setRefreshTokenInCookies } from "@/utils/cookies.utils.js";

// ALL THE CONTROLLERS ARE WRAPPED IN ASYNC HANDLER TO CATCH ERRORS AND PASS THEM TO THE ERROR HANDLER MIDDLEWARE


/*
    SIGNUP CONTROLLER
    
*/

const signUpController: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const signUpDTO = new SignUpDTO(req.body);
    const result = await signUpService(signUpDTO);
    setRefreshTokenInCookies(res, result.refreshToken, 7 * 24 * 60 * 60 * 1000);
    return res.status(201).json({
        userName: result.user.userName,
        userEmail: result.user.userEmail,
        accessToken: result.accessToken,
        success: true,
        message: "User signed up successfully"
    });
});

const logInController: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const loginDTO = new LoginDTO(req.body);
    const result = await logInService(loginDTO);
    setRefreshTokenInCookies(res, result.refreshToken, 7 * 24 * 60 * 60 * 1000);
    return res.status(200).json({
        userName: result.user.userName,
        userEmail: result.user.userEmail,
        accessToken: result.accessToken,
        success: true,
        message: "User logged in successfully"
    });
});


const logOutController: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userRefreshToken = getRefreshTokenFromCookies(req);
    const success = await logOutService(req.userEmail, userRefreshToken);
    res.clearCookie("refreshToken");
    return res.status(200).json({
        success: success,
        message: "User logged out successfully"
    });
});


const refreshTokenController: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userRefreshToken = getRefreshTokenFromCookies(req);
    const newAccessToken = await refreshTokenRotationService(userRefreshToken);
    res.clearCookie("refreshToken");
    setRefreshTokenInCookies(res, newAccessToken.refreshToken, 7 * 24 * 60 * 60 * 1000);
    return res.status(200).json({
        success: true,
        message: "Access token refreshed successfully",
        accessToken: newAccessToken.accessToken
    });
});

export { signUpController, logInController, logOutController, refreshTokenController };