import type { RequestHandler, Response, Request, NextFunction } from "express";
import { verifyToken } from "@/utils/jwt.utils.js";
import env from "@/config/env.config.js";
import { AuthorisationError } from "@/errors/auth.errors.js";

export const authenticateAdmin : RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: No access token provided"
        });
    }
    const accessToken = authHeader.split(" ")[1];
    if(!accessToken){
        return res.status(401).json({
            success: false,
            message: "Unauthorized: No access token provided"
        });
    }
    
    let user;
    try {
        user = verifyToken(accessToken, env.JWT_SECRET_ACCESS_TOKEN);
    } catch(err) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized Access"
        });
    }
    
    if(!user){
        return res.status(401).json({
            success: false,
            message: "Unauthorized Access"
        });
    }
    
    if(user.exp && user.exp < Math.floor(Date.now() / 1000)){
        return res.status(401).json({
            success: false,
            message: "Unauthorized Access"
        });
    }
    
    // Admin check
    if(user.userEmail !== env.ADMIN_EMAIL) {
        return next(new AuthorisationError("You are not authorised to perform this action"));
    }
    
    req.userEmail = user.userEmail;
    next();
};
