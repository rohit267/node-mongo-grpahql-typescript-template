import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";
import express, { Response } from "express";
import useragent from "express-useragent";
import { sendMail } from "./adapters/mailer";
import { helloResolver, rootResolvers } from "./graphql/resolvers/root";
import { getUserFormToken, loadGQLFiles } from "./graphql/utils";
import { UserType } from "./models/users";
import { connectDB } from "./providers/MongoDB";
import authRouter from "./routes/auth";
import filesRoute from "./routes/files";
import userRouter from "./routes/user";
import env from "./utils/environ";
import { errorHandler, notFoundHandler } from "./utils/ErrorExceptionHandlers";
import Logger from "./utils/Logger";

process.env.TZ = "Asia/Kolkata";

export interface Context {
    user: UserType | null;
    req: express.Request;
    res: Response;
}

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(useragent.express());
app.use(cookieParser());

const whitelist = [
    "http://localhost:3000",
];

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
        "Access-Control-Allow-Origin",
        whitelist.find((w) => w === req.headers.origin)
    );
    res.header("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, *"
    );
    next();
});

app.get("/", (_, res: Response) => {
    res.send("Hello World!");
});

app.post("/util/mailer", async (req, res) => {
    const { to, subject, html } = req.body;
    sendMail(to, subject, html);
    res.send({
        status: "success",
        message: "Email queued for delivery",
    });
});

// REST Routes
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/files", filesRoute);

// Static files
app.use("/static", express.static(process.cwd() + "/static"));

// GraphQL
const server = new ApolloServer<Context>({
    typeDefs: loadGQLFiles(),
    resolvers: [
        rootResolvers,
        helloResolver,
    ],
    context: async (c) => {
        const { req } = c;
        let token = "";
        if (req.headers.authorization) {
            token = req.headers.authorization?.split(" ")[1] || "";
        } else if (req?.query?.accessToken) {
            token = req.query.accessToken as string;
        } else if (req.cookies["accessToken"]) {
            token = req.cookies["accessToken"];
        }
        const user = await getUserFormToken(token);
        return { user };
    },
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
    introspection: true,
});

(async () => {
    try {
        await server.start();
        console.log(whitelist);
        server.applyMiddleware({ app, cors: { origin: whitelist } });

        app.listen(env.get("PORT"), async () => {
            await connectDB();
            Logger.info(
                `Server started at http://localhost:${env.get("PORT")}`
            );
        });

        // Error Handlers
        app.use(notFoundHandler);
        app.use(errorHandler);
    } catch (e) {
        console.log(e);
    }
})();

process.once("SIGUSR2", function () {
    process.kill(process.pid, "SIGUSR2");
});

process.on("SIGINT", function () {
    // this is only called on ctrl+c, not restart
    process.kill(process.pid, "SIGINT");
});
