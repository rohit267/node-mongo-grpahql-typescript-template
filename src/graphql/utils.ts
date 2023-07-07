import { UserDB } from './../models/users';
import { gql } from "apollo-server-core";
import fs from "fs";
import * as nodepath from "path";
import { TokenPayloadType, verifyAccessToken } from "../adapters/token";

const BASE_PATH = "src/graphql/schemas";

export function loadGQLFiles() {
    const schema = fs
        .readdirSync(BASE_PATH)
        .map((filename) =>
            fs.readFileSync(nodepath.join(BASE_PATH, filename)).toString()
        )
        .join();
    return gql(schema);
}

export async function getUserFormToken(token: string) {
   
    const verifiedToken: TokenPayloadType = verifyAccessToken(
        token
    ) as TokenPayloadType;
    if (verifiedToken) {
        const user = await UserDB.findOne({"object.email" : verifiedToken.email });
        return user;
    }
    return null;
}
