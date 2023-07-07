import express, { NextFunction, Request, Response } from "express";
import formidable from "formidable";
import fs from "fs-extra";
import path from "path";
import sharp from "sharp";
import auth from "../middlewares/auth";
import { OkResponse } from "../utils/Response";
import { HTTPError } from "./../utils/ErrorExceptionHandlers";
const router = express.Router();


router.post("/pdf", auth, async (req, res, next) => {
    return uploadFile(req, res, next, false);
});

async function uploadFile(
    req: Request,
    res: Response,
    next: NextFunction,
    isAvatar = false
) {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, { file }) => {
        if (err) {
            console.error(err);
            res.status(500).send("Internal server error");
            return;
        }
        try {
            // @ts-ignore
            const { filepath, originalFilename } = file;
            const ext = path.extname(originalFilename).toLowerCase();
            let newPath = "";
            let pathWithName = "";
            if (isAvatar) {
                newPath = `static/userAvatar`;
                pathWithName = newPath + "/" + fields.userId + ext || ".jpg";
                if (ext !== ".png" && ext !== ".jpeg" && ext !== ".jpg") {
                    return next(
                        new HTTPError(
                            400,
                            "Invalid file type. Only PNG, JPEG, and JPG files are allowed."
                        )
                    );
                }
                checkDir(newPath);
                await sharp(filepath.toString())
                    .resize({ width: 350, withoutEnlargement: true })
                    .toFile(pathWithName);
                fs.unlinkSync(filepath.toString());
            } else {
                newPath = `static/pdfs`;
                pathWithName = newPath + "/" + fields.pdfName + ext;
                checkDir(newPath);

                fs.moveSync(filepath, pathWithName, {overwrite: true});
            }

            return res.send(new OkResponse({ path: pathWithName }));
        } catch (err) {
            console.error(err);
            res.status(500).send("Internal server error 1");
        }
    });
}

function checkDir(newPath: string) {
    if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath);
    }
}

export default router;
