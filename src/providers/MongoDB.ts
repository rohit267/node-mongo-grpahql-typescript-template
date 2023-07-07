import { MongoClient } from "mongodb";
import Environ from "../utils/environ";
import Logger from "../utils/Logger";

const client = new MongoClient(Environ.get("MONGODB_URL"), {
    connectTimeoutMS: 3000,
    serverSelectionTimeoutMS: 3000,
});

export async function connectDB() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        Logger.info("Connected successfully to MongoDB server");
        process.on("SIGINT", function () {
            client.close();
            process.exit();
        });
    } catch (err) {
        Logger.error("Error connecting to MongoDB server", err);
        Logger.debug("Retrying after 3 seconds...");
        setTimeout(() => connectDB(), 3000);
    }
}

export const db = client.db(Environ.get("DB_NAME"));
