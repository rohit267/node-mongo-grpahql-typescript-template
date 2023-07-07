import * as dotenv from "dotenv";

export default class Environ {
    static get(key: string): string {
        if (process.env.NODE_ENV === "production") {
            const v = process.env[key];
            if (!!v) return v;
            throw `Env var ${key} Not found`;
        } else {
            const env = dotenv.config({
                path: process.cwd() + "/.env",
            });
            if (env.error) {
                throw env.error;
            }

            return env.parsed?.[key] || "";
        }
    }
}
