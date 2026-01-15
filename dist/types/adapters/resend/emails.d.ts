import type { Autosend } from "../../core/client.js";
import type { SendEmailOptions, ApiResponse, CreateEmailResponse } from "./types.js";
export declare class EmailsAdapter {
    private readonly client;
    constructor(client: Autosend);
    private getRecipientCount;
    send(options: SendEmailOptions): Promise<ApiResponse<CreateEmailResponse>>;
    private sendBulk;
}
//# sourceMappingURL=emails.d.ts.map