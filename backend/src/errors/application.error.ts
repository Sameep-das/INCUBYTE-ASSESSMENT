export default class ApplicationError extends Error {
    statusCode: number;
    constructor(message: string){
        super(message);
        this.name = "ApplicationError";
        this.message = message;
        this.statusCode = 500;
    }
}

