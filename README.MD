# Node.js Graphql Mongodb Typescript Template or Boilerplate

This is a basic nodejs template or boilderplate with graphql and mongodb.

## Usage:
- Install deps using `yarn install` or `pnpm install` or `npm install`.
- Add all environment variables to the `.env` file.
- Start dev server using `yarn dev` / `npm run dev`. For `pnpm` use `pnpm dev-pn`.

## Features:
- Automaic server restarts when file changes.
- Using native `mongodb` module.
- Scheme modeling and validation using `zod`
- Automatic types generation using `Graphql Codegen`
- Mailer using `nodemailer`
- Authentication using `jsonwebtoken` and middleware
- File upload using `formidable`
- Dockerfile for a docker image. 

### To define a new zod schema and MongoDB type in typescirpt:

```ts
import { Document, ObjectId } from "mongodb";
import { z } from "zod";
import { BaseCollection } from "../providers/Collection";
import Constants from "../utils/constants";
import Environ from "../utils/environ";

/**
 * In Graphql Schema: 
type Subject {
    code: String!
    title: String!
    belongsTo: SubjectBelongsTo!
    files:[File]
}
 * */
export const SubjectSchema = z.object({
    code: z.string(),
    title: z.string(),
    _id: z.instanceof(ObjectId).optional(),
});

type mSubject = z.infer<typeof SubjectSchema>;
export interface SubjectType extends Document, mSubject {}

export const SubjectDB = new BaseCollection<SubjectType>(
    Environ.get(Constants.SUBJECTS_COLLECTION)
);
```
