"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAutosendBulkRequest = exports.mapHttpStatusToResendError = exports.parseEmailAddresses = exports.parseEmailAddress = exports.Resend = void 0;
const client_js_1 = require("../../core/client.cjs");
const emails_js_1 = require("./emails.cjs");
const contacts_js_1 = require("./contacts.cjs");
class Resend {
    emails;
    contacts;
    constructor(apiKey, options = {}) {
        const key = apiKey ?? process.env.RESEND_API_KEY;
        if (!key) {
            throw new Error("Missing API key. Pass it to the constructor or set the RESEND_API_KEY environment variable.");
        }
        const autosendClient = new client_js_1.Autosend(key, {
            baseUrl: options.baseUrl,
            timeout: options.timeout,
            debug: options.debug,
        });
        this.emails = new emails_js_1.EmailsAdapter(autosendClient);
        this.contacts = new contacts_js_1.ContactsAdapter(autosendClient);
    }
}
exports.Resend = Resend;
__exportStar(require("./types.cjs"), exports);
var transforms_js_1 = require("./transforms.cjs");
Object.defineProperty(exports, "parseEmailAddress", { enumerable: true, get: function () { return transforms_js_1.parseEmailAddress; } });
Object.defineProperty(exports, "parseEmailAddresses", { enumerable: true, get: function () { return transforms_js_1.parseEmailAddresses; } });
Object.defineProperty(exports, "mapHttpStatusToResendError", { enumerable: true, get: function () { return transforms_js_1.mapHttpStatusToResendError; } });
Object.defineProperty(exports, "toAutosendBulkRequest", { enumerable: true, get: function () { return transforms_js_1.toAutosendBulkRequest; } });
//# sourceMappingURL=index.js.map