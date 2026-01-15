import { HttpClient } from "../http/client.mjs";
import { Emails } from "./emails.mjs";
import { Contacts } from "./contacts.mjs";
export class Autosend {
    emails;
    contacts;
    http;
    constructor(apiKey, options = {}) {
        const config = {
            apiKey,
            ...options,
        };
        this.http = new HttpClient(config);
        this.emails = new Emails(this.http);
        this.contacts = new Contacts(this.http);
    }
}
//# sourceMappingURL=client.js.map