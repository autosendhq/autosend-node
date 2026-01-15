import { EmailsAdapter } from "./emails.js";
import { ContactsAdapter } from "./contacts.js";
export interface ResendOptions {
    baseUrl?: string;
    timeout?: number;
    debug?: boolean;
}
export declare class Resend {
    readonly emails: EmailsAdapter;
    readonly contacts: ContactsAdapter;
    constructor(apiKey?: string, options?: ResendOptions);
}
export * from "./types.js";
export { parseEmailAddress, parseEmailAddresses, mapHttpStatusToResendError, toAutosendBulkRequest } from "./transforms.js";
//# sourceMappingURL=index.d.ts.map