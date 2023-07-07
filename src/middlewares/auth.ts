import { UserDB } from './../models/users';
import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { UserType } from "../models/users";
import Constants from "../utils/constants";
import Environ from "../utils/environ";
import { HTTPError } from "../utils/ErrorExceptionHandlers";
import Logger from "../utils/Logger";
interface RequestWithUser extends Request {
    user: UserType;
}

export default async function auth(
    req: Request | RequestWithUser,
    res: Response,
    next: NextFunction
) {
    try {
        let token = "";
        if (req.header("Authorization")) {
            token = req.header("Authorization")?.split(" ")[1] || "";
        } else if (req?.query?.accessToken) {
            token = req.query.accessToken as string;
        } else if (req.cookies["accessToken"]) {
            token = req.cookies["accessToken"];
        }
        if (!token) {
            return res.status(403).end();
        }
        const decoded = jwt.verify(token, Environ.get(Constants.JWT_SECRET));
        const user = (await UserDB.find({
            _id: new ObjectId((decoded as any).userId),
        })) as unknown as UserType;
        if (!user) {
            return next(new HTTPError(401, Constants.UNAUTHORIZED));
        }
        // @ts-ignore
        req["user"] = user;
        next();
    } catch (err) {
        Logger.error("Auth Middle: ", err);
        return next(new HTTPError(401, "Token Expired"));
    }
}
