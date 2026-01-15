import type { HttpClient } from "../http/client.js";
import type { SendEmailOptions, SendEmailResponse, BulkSendEmailOptions, BulkSendEmailResponse } from "./types.js";
export declare class Emails {
    private readonly http;
    constructor(http: HttpClient);
    send(options: SendEmailOptions): Promise<SendEmailResponse>;
    bulk(options: BulkSendEmailOptions): Promise<BulkSendEmailResponse>;
}
//# sourceMappingURL=emails.d.ts.map