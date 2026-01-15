"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Autosend = void 0;
const client_js_1 = require("../http/client.cjs");
const emails_js_1 = require("./emails.cjs");
const contacts_js_1 = require("./contacts.cjs");
class Autosend {
    emails;
    contacts;
    http;
    constructor(apiKey, options = {}) {
        const config = {
            apiKey,
            ...options,
        };
        this.http = new client_js_1.HttpClient(config);
        this.emails = new emails_js_1.Emails(this.http);
        this.contacts = new contacts_js_1.Contacts(this.http);
    }
}
exports.Autosend = Autosend;
//# sourceMappingURL=client.js.map