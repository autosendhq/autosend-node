export class Emails {
    http;
    constructor(http) {
        this.http = http;
    }
    async send(options) {
        const response = await this.http.post("/mails/send", options);
        if (response.success && response.data) {
            return {
                success: true,
                data: {
                    emailId: response.data.emailId,
                },
            };
        }
        return {
            success: false,
            error: response.error,
        };
    }
    async bulk(options) {
        const response = await this.http.post("/mails/bulk", options);
        if (response.success && response.data) {
            return {
                success: true,
                data: {
                    emailIds: response.data.emailIds,
                },
            };
        }
        return {
            success: false,
            error: response.error,
        };
    }
}
//# sourceMappingURL=emails.js.map