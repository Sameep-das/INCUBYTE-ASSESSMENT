export class AuthenticationError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = "AuthenticationError";
        this.message = message;
        this.statusCode = 401;
    }
}

export class TokenExpiredError extends AuthenticationError {
    constructor(message: string = "Token has expired") {
        super(message);
        this.name = "TokenExpiredError";
        this.message = message;
        this.statusCode = 401;
    }
}

export class InvalidTokenError extends AuthenticationError {
    constructor(message: string = "Invalid token") {
        super(message);
        this.name = "InvalidTokenError";
        this.message = message;
        this.statusCode = 401;
    }
}

export class DuplicateUserError extends Error {
    constructor(message: string, public statusCode: number = 409) {
        super(message);
        this.name = "DuplicateUserError";
        this.statusCode = 409;
    }
}

export class InvalidCredentialsError extends AuthenticationError {
    constructor(message: string, public readonly statusCode: number) {
        super(message);
        this.name = "InvalidCredentialsError";
        this.statusCode = statusCode;
    }
}

export  class InvalidRequestError extends Error {
    statusCode: number;
    constructor(message : string){
        super(message);
        this.name = "InvalidRequestError";
        this.message = message;
        this.statusCode = 400;
    }
}

export class AuthorisationError extends Error {
    statusCode: number;
    constructor(message: string = "Not authorised to access this resource") {
        super(message);
        this.name = "AuthorisationError";
        this.message = message;
        this.statusCode = 403;
    }
}