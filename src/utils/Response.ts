//custom response class
export class OkResponse {
    status: number;
    message: string;
    data: any;
    success: true;
    constructor(data: any, message: string = "ok", status: number = 200) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.success = true;
    }
}
