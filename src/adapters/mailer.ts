import nodemailer from "nodemailer";
import Environ from "../utils/environ";
import Logger from "../utils/Logger";

export async function sendMail(to: string, subject: string, html: string) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: Environ.get("SMPT_HOST"),
        auth: {
            user: Environ.get("SMPT_USER"),
            pass: Environ.get("SMPT_PASS"),
        },
    });

    const info = await transporter.sendMail({
        from: `Code2Serve.in ${Environ.get("SMPT_FROM")}`,
        to,
        subject,
        html,
    });

    Logger.info("email sent:", info);
}
