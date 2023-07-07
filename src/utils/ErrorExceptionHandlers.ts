import { Request, Response, NextFunction } from "express";
import Constants from "./constants";
import Logger from "./Logger";

export class HTTPError extends Error {
    status: number;
    stack: any;
    error: any;
    constructor(status: number, message: string, error?: any, stack?: any) {
        super(message);
        this.status = status;
        this.stack = stack;
        this.error = error;
    }
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const path = req.path;
    if (err instanceof HTTPError) {
        Logger.error(`PATH: "${path}": ${err.message}`, err.stack);
        res.status(err.status).send({
            status: err.status,
            success: false,
            message: err.message,
            error: err.error,
        });
    } else if (err instanceof SyntaxError) {
        Logger.error(`PATH: "${path}": ${err.message}`, err.stack);
        res.status(400).send({
            status: 400,
            success: false,
            message: Constants.BAD_REQUEST,
            error: [err.message],
        });
    } else {
        Logger.error(`PATH: "${path}": ${err.message}`, err.stack);
        res.status(500).send({
            status: 400,
            message: Constants.INTERNAL_SERVER_ERROR,
        });
    }
};

export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    next(new HTTPError(404, "Not Found"));
};

export function zodErrorMapper(err: any) {
    console.log(JSON.stringify(err));
    return err?.issues.map((issue: any) => issue.message);
}
