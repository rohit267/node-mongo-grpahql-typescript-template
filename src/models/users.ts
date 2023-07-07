import { Document, ObjectId } from "mongodb";
import { z } from "zod";
import { BaseCollection } from "../providers/Collection";
import Environ from "../utils/environ";

const nameValidator = z
    .string()
    .trim()
    .min(3, {
        message: "Name must be at least 3 characters long",
    })
    .max(120, {
        message: "Name must be at most 100 characters long",
    })
    .regex(/^[a-zA-Z ]+$/, {
        message: "Name must contain only alphabets",
    });

export const UserSchema = z.object({
    meta: z.object({
        created_at: z.string().default(Date.now().toString()),
        updated_at: z.string().default(Date.now().toString()),
    }),
    object: z.object({
        name: nameValidator,
        email: z
            .string()
            .email({
                message: "Email must be a valid email address",
            })
            .trim(),
        mobile: z.string().regex(/^\d{10}$/, {
            message: "Mobile number must be 10 digits long",
        }),

        imgUrl: z.string().optional(),
        tokens: z.array(z.string()).optional(),
        password: z.string(),
    }),
    _id: z.instanceof(ObjectId).optional(),
});

type mUser = z.infer<typeof UserSchema>;
export interface UserType extends Document, mUser {}

export const UserDB = new BaseCollection<UserType>(
    Environ.get("USERS_COLLECTION")
);
