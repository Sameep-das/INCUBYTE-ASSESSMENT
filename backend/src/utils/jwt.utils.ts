import jwt, {  type Secret, type SignOptions } from "jsonwebtoken";
import type { JWTObject } from "@/types/auth.types.js"
import {AuthenticationError, TokenExpiredError, InvalidTokenError} from "@/errors/auth.errors.js";

export function generateToken(payload : JWTObject, secret : Secret, time : NonNullable<SignOptions["expiresIn"]>) {
    return jwt.sign(payload, secret, { expiresIn: time });
}

export function verifyToken(token : string, secret : Secret) : JWTObject {
    try {
        return jwt.verify(token, secret) as JWTObject;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new TokenExpiredError();
        } 
        if (error instanceof jwt.JsonWebTokenError) {
            throw new InvalidTokenError();
        }
        throw new AuthenticationError("An error occurred while verifying the token");
    }
}
