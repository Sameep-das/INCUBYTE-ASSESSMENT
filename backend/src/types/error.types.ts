export type ErrorSchema = {
    statusCode: number;
    message: string;
    name: string;
    success: boolean | undefined | null;
    isOperational: boolean | undefined | null;
}