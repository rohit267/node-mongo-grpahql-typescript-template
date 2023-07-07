import express from "express";
import {
    createUser,
    generateAndSaveTokens,
    getUser,
    hashPassword,
    loginUser,
    sendSaveOTP,
} from "../adapters/user";
import Constants from "../utils/constants";
import { HTTPError } from "../utils/ErrorExceptionHandlers";
import { OkResponse } from "../utils/Response";
import { UserDB } from "./../models/users";

const router = express.Router();
// router.use("/", (request, res, next) =>
//     isMobile(request as RequestWithUserAgent, res, next)
// );

router.post("/login", async (req, res, next) => {
    return loginUser(req, res, next);
});

/**
 * @route GET /auth/register
 * @body
 * Register user with all the details
 */
router.post("/register", async (req, res, next) => {
    return await createUser(req, res, next);
});

// refresh token
router.post("/refresh", async (req, res, next) => {
    const { refreshToken, email } = req.body;

    if (!refreshToken) {
        return next(new HTTPError(400, Constants.BAD_REQUEST));
    }

    const user = await getUser(email);
    if (!user) {
        return next(new HTTPError(400, Constants.BAD_REQUEST));
    }

    if (user.tokens && user.tokens.includes(refreshToken)) {
        return generateAndSaveTokens(email, req, res, next);
    }

    return next(new HTTPError(403, Constants.UNAUTHORIZED));
});

// send otp
router.post("/emailOTP", async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new HTTPError(400, Constants.BAD_REQUEST));
    }

    return await sendSaveOTP(req, res, next);
});

// // verify otp
// router.post("/verifyOTP", async (req, res, next) => {
//     const { email, otp } = req.body;

//     if (!email || !otp) {
//         return next(new HTTPError(400, Constants.BAD_REQUEST));
//     }

//     const user = await getUser(email);

//     if (!user) {
//         return next(new HTTPError(400, Constants.BAD_REQUEST));
//     }

//     if (user.emailOtp == otp) {
//         return res.send(
//             new OkResponse({
//                 email: user.email,
//                 verified: true,
//             })
//         );
//     } else {
//         return next(new HTTPError(400, "OTP is incorrect"));
//     }
// });

/**
 * @route POST /auth/forgotPassword
 * @body {email, otp, newPassword}
 */
// router.post("/forgotPassword", async (req, res, next) => {
//     const { email, otp, newPassword } = req.body;

//     if (!email || !otp || !newPassword || newPassword.length < 8) {
//         return next(
//             new HTTPError(
//                 400,
//                 Constants.BAD_REQUEST +
//                     ". Password length must be at least 8 characters."
//             )
//         );
//     }

//     const user = await getUser(email);

//     if (!user) {
//         return next(new HTTPError(400, Constants.USER_NOT_FOUND));
//     }

//     if (user.emailOtp == otp) {
//         const hashedPassword = await hashPassword(req.body.newPassword);
//         const saveRes = await UserDB.updateOne(
//             { _id: user._id },
//             {
//                 $set: { "object.password": hashedPassword },
//             }
//         );
//         return res.send(new OkResponse({ updated: true }));
//     } else {
//         return next(new HTTPError(400, "OTP is incorrect"));
//     }
// });

export default router;
