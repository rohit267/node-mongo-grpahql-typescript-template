import { Response, NextFunction } from "express";
import { DefaultAgent } from "express-useragent";
import Constants from "../utils/constants";
import { HTTPError } from "../utils/ErrorExceptionHandlers";

export interface RequestWithUserAgent extends Express.Request {
    useragent: typeof DefaultAgent;
}

export default async function isMobile(
    req: RequestWithUserAgent,
    _: Response,
    next: NextFunction
) {
    try {
        const isMobile = req.useragent.isMobile;
        if (isMobile) {
            next();
        } else {
            next(new HTTPError(403, Constants.UNAUTHORIZED));
        }
    } catch (err) {
        next(new HTTPError(500, Constants.INTERNAL_SERVER_ERROR));
    }
}
