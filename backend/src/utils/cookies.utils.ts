import env from "@/config/env.config.js";
import type { Request, Response } from "express";

export function getRefreshTokenFromCookies(request : Request): string | undefined {
    if(request.cookies === undefined || request.cookies.refreshToken === undefined){
        return undefined;
    }
    return request.cookies.refreshToken;
}

export function setRefreshTokenInCookies(response: Response, refreshToken: string, maxAge: number): void {
    response.cookie(
        "refreshToken",
        refreshToken,
        {
            httpOnly: true,
            sameSite: "none",
            path: "/",
            maxAge: maxAge,
            secure: env.NODE_ENV === "PRODUCTION"
        }
    );
}