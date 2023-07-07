import { UserDB } from './../models/users';
import express from "express";
import { getUser } from "../adapters/user";
import Constants from "../utils/constants";
import { HTTPError } from "../utils/ErrorExceptionHandlers";
import { OkResponse } from "../utils/Response";

const userRouter = express.Router();

userRouter.get("/search/:query", async (req, res, next) => {
    const query: any = req.params.query;
    if (!query) return next(new HTTPError(400, Constants.BAD_REQUEST));

    const users = await UserDB.find(
        {
            $or: [
                {
                    "object.name": { $regex: `^${query}`, $options: "i" },
                },
                {
                    "object.email": { $regex: `^${query}`, $options: "i" },
                },
            ],
        },
        {
            projection: {
                "meta.isDeleted": 0,
                "object.deviceId": 0,
                "object.tokens": 0,
                "object.emailOtp": 0,
                "object.password": 0,
            },
        }
    );

    return res.send(new OkResponse(users, "success", 200));
});

userRouter.get("/:email", async (req, res, next) => {
    const email = req.params.email;
    if (!email) {
        return new HTTPError(400, "Bad Request");
    }

    const user = await getUser(email);
    if (!user) {
        return next(new HTTPError(404, "User not found"));
    }
    return res.send(user);
});

export default userRouter;
