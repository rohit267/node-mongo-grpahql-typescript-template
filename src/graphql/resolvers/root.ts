import { Resolvers } from "../../generated/graphql";

export const helloResolver: Pick<Resolvers, "HelloQuery"> = {
    HelloQuery: {
        hello: () => "Hello World!",
    },
};

export const rootResolvers = {
    RootQuery: {
        hello: () => ({}),
    },
};
