export function generateOTP(length: number) {
    const otp = Math.floor(Math.random() * 10 ** length);
    return otp;
}

export const flattenObject = (obj: object) => {
    const flattened = {};

    Object.keys(obj).forEach((key) => {
        // @ts-ignore
        const value = obj[key];

        if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
        ) {
            Object.assign(flattened, flattenObject(value));
        } else {
            // @ts-ignore
            flattened[key] = value;
        }
    });

    return flattened;
};