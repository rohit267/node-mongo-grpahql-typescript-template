const chalk = require("chalk");
class Logger {
    static info(message: any, object?: any) {
        console.log(
            `[${this.getTimeStamp()}]`,
            chalk.blue(`[INFO] ${message}`),
            object ? JSON.stringify(object,null,2) : ""
        );
    }

    static warn(message: any, object?: any) {
        console.log(
            `[${this.getTimeStamp()}]`,
            chalk.yellow(`[WARN] ${message}`),
            object ? JSON.stringify(object,null,2) : ""
        );
    }

    static error(message: any, object?: any) {
        console.log(
            `[${this.getTimeStamp()}]`,
            chalk.red(`[ERROR] ${message}`),
            object ? JSON.stringify(object,null,2) : ""
        );
    }

    static debug(message: any, object?: any) {
        console.log(
            `[${this.getTimeStamp()}]`,
            chalk.magenta(`[DEBUG] ${message}`),
            object ? JSON.stringify(object, null, 2) : ""
        );
    }

    static getTimeStamp() {
        const date = new Date();
        return `${date.getDate()}/${
            date.getMonth() + 1
        }/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
    }
}

export default Logger;

// Logger.info("Hello World", { name: "John Doe" })
