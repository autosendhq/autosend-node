import { HttpClient } from "../http/client.js";
import { Emails } from "./emails.js";
import { Contacts } from "./contacts.js";
export interface AutosendOptions {
    baseUrl?: string;
    timeout?: number;
    debug?: boolean;
    maxRetries?: number;
}
export declare class Autosend {
    readonly emails: Emails;
    readonly contacts: Contacts;
    readonly http: HttpClient;
    constructor(apiKey: string, options?: AutosendOptions);
}
//# sourceMappingURL=client.d.ts.map