export class CarAlreadyExistsError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = "CarAlreadyExistsError";
        this.message = message;
        this.statusCode = 409;
    }
}

export class CarNotFoundError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = "CarNotFoundError";
        this.message = message;
        this.statusCode = 404;
    }
}