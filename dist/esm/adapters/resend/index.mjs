import { Autosend as AutosendCore } from "../../core/client.mjs";
import { EmailsAdapter } from "./emails.mjs";
import { ContactsAdapter } from "./contacts.mjs";
export class Resend {
    emails;
    contacts;
    constructor(apiKey, options = {}) {
        const key = apiKey ?? process.env.RESEND_API_KEY;
        if (!key) {
            throw new Error("Missing API key. Pass it to the constructor or set the RESEND_API_KEY environment variable.");
        }
        const autosendClient = new AutosendCore(key, {
            baseUrl: options.baseUrl,
            timeout: options.timeout,
            debug: options.debug,
        });
        this.emails = new EmailsAdapter(autosendClient);
        this.contacts = new ContactsAdapter(autosendClient);
    }
}
export * from "./types.mjs";
export { parseEmailAddress, parseEmailAddresses, mapHttpStatusToResendError, toAutosendBulkRequest } from "./transforms.mjs";
//# sourceMappingURL=index.js.map