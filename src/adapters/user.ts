import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { UserDB, UserSchema } from "../models/users";
import { generateOTP } from "../utils";
import Constants from "../utils/constants";
import { HTTPError, zodErrorMapper } from "../utils/ErrorExceptionHandlers";
import Logger from "../utils/Logger";
import { OkResponse } from "../utils/Response";
import { sendMail } from "./mailer";
import { getTokens } from "./token";

export async function createUser(req: Request, res: Response, next: any) {
    //check if user exists
    const previousUser = await UserDB.find({
        "object.email": req.body.email,
    });

    if (previousUser.length > 0) {
        return next(new HTTPError(400, Constants.USER_ALREADY_EXISTS));
    }

    if (req.body.password && req.body.password.length < 8) {
        return next(new HTTPError(400, Constants.PASSWORD_LENGTH));
    }

    const hashedPassword = await hashPassword(req.body.password);

    const userObj = {
        meta: {
            created_at: Date.now() + "",
            updated_at: Date.now() + "",
        },
        object: {
            ...req.body,
            password: hashedPassword,
            tokens: []
        },
        _id: new ObjectId(),
    };

    const parsed = UserSchema.safeParse(userObj);

    if (!parsed.success) {
        return next(
            new HTTPError(
                400,
                Constants.BAD_REQUEST,
                zodErrorMapper(parsed.error)
            )
        );
    } else {
        const newUserId = await UserDB.insertOne(parsed.data);
        const { accessToken, refreshToken } = await getTokens({
            userId: newUserId.toString(),
            name: parsed.data.object.name,
            email: parsed.data.object.email,
            mobile: parsed.data.object.mobile,
        });

        const modifyRes = await UserDB.updateOne(
            { _id: newUserId.toString() },
            {
                $set: {
                    "object.tokens": [refreshToken],
                },
            }
        );

        return res.json(
            new OkResponse(
                { accessToken, refreshToken },
                Constants.USER_CREATED,
                201
            )
        );
    }
}

export async function getUser(email: string) {
    const user = await UserDB.find({
        $or: [{ "object.email": { $eq: email } }],
    });
    if (user.length === 1) {
        const data = {
            ...user[0].object,
            // @ts-ignore
            _id: user[0]._id.toString(),
        };
        return data;
    }
    return null;
}

export async function generateAndSaveTokens(
    email: string,
    req: Request,
    res: Response,
    next: NextFunction
) {
    const user = await getUser(email);
    if (user) {

        const tokens = user.tokens?.length ?? 0;

        if (tokens > 3) {
            Logger.info("Deleting oldest token for user: + " + user.email);

            const saveRes = await UserDB.updateOne(
                { _id: user._id },
                {
                    $set: { "object.tokens": user.tokens!.shift() },
                }
            );

            if (!saveRes) {
                return next(
                    new HTTPError(500, Constants.INTERNAL_SERVER_ERROR)
                );
            }
        }

        const payload = {
            email: user.email,
            name: user.name,
            mobile: user.mobile,
            userId: user._id,
        };

        const { accessToken, refreshToken } = await getTokens(payload);

        const saveRes = await UserDB.updateOne(
            { _id: user._id },
            {
                $set: { "object.tokens": [...user.tokens!, refreshToken] },
            }
        );

        if (!saveRes) {
            return next(new HTTPError(500, Constants.INTERNAL_SERVER_ERROR));
        }

        return res.send(
            new OkResponse({
                accessToken,
                refreshToken,
            })
        );
    }

    return next(new HTTPError(404, Constants.USER_NOT_FOUND));
}

export async function sendSaveOTP(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const user = await getUser(req.body.email);

    if (user) {
        const otp = generateOTP(6);
        const saveRes = await UserDB.updateOne(
            { _id: user._id },
            {
                $set: { "object.emailOtp": otp },
            }
        );

        if (!saveRes) {
            return next(new HTTPError(500, Constants.INTERNAL_SERVER_ERROR));
        }

        await sendMail(req.body.email, "OTP Verify Email", otp + "");

        return res.send(new OkResponse({ sent: true }));
    }

    return next(new HTTPError(404, Constants.USER_NOT_FOUND));
}

export async function loginUser(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const user = await getUser(req.body.userId);

    if (user) {
        const isPasswordCorrect = comparePassword(
            req.body.password,
            user.password
        );
        if (isPasswordCorrect) {
            return await generateAndSaveTokens(req.body.userId, req, res, next);
        }

        return next(new HTTPError(401, Constants.USER_NOT_FOUND));
    }

    return next(new HTTPError(404, Constants.USER_NOT_FOUND));
}

export async function hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export function comparePassword(password: string, hash: string) {
    return bcrypt.compareSync(password, hash);
}
