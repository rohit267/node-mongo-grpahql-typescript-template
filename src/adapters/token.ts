import * as jwt from "jsonwebtoken";
import Environ from "../utils/environ";
import Constants from "../utils/constants";

export type TokenPayloadType = {
    userId: string;
    name: string;
    email: string;
    mobile: string;
};

export function generateAccessToken(payload: TokenPayloadType) {
    return jwt.sign(payload, Environ.get(Constants.JWT_SECRET), {
        expiresIn: Environ.get(Constants.JWT_ACCESS_EXPIRATION),
    });
}

export function generateRefreshToken(payload: TokenPayloadType) {
    return jwt.sign(payload, Environ.get(Constants.JWT_SECRET), {
        expiresIn: Environ.get(Constants.JWT_REFRESH_EXPIRATION),
    });
}

export function verifyAccessToken(token: string) {
    try {
        const decoded = jwt.verify(token, Environ.get(Constants.JWT_SECRET));
        return decoded;
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return false;
        } else {
            //TODO Account compromised
            return false;
        }
    }
}

export function verifyRefreshToken(token: string) {
    try {
        const decoded = jwt.verify(token, Environ.get(Constants.JWT_SECRET));
        return decoded;
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return false;
        } else {
            //TODO Account compromised
            return false;
        }
    }
}

export async function getTokens(payload: TokenPayloadType) {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { accessToken, refreshToken };
}
