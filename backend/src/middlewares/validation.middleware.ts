import type { NextFunction, Request, Response, RequestHandler } from 'express';
import { type ZodType } from 'zod';
import {InvalidRequestError}  from '@/errors/auth.errors.js';


// validates the schema based on the type passed in the parameter
// calls error handler middleware if validation fails
const validateSchema = (schema : ZodType)  : RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        const validationResult = schema.safeParse(req.body);
        if(!validationResult.success){
            const message = validationResult.error.issues.map((issue) => issue.message).join(', ');
            const error = new InvalidRequestError(message);
            return next(error);
        }
        req.body = validationResult.data;
        next();
    };
};
export default validateSchema;