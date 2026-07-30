declare global {
    namespace Express {
        interface Request {
            userEmail ?: string;
            userId ?: string;
            refreshToken ?: string;
            sessionId ?: string;
        }
    }
}