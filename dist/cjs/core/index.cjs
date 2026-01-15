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
exports.Contacts = exports.Emails = exports.Autosend = void 0;
var client_js_1 = require("./client.cjs");
Object.defineProperty(exports, "Autosend", { enumerable: true, get: function () { return client_js_1.Autosend; } });
var emails_js_1 = require("./emails.cjs");
Object.defineProperty(exports, "Emails", { enumerable: true, get: function () { return emails_js_1.Emails; } });
var contacts_js_1 = require("./contacts.cjs");
Object.defineProperty(exports, "Contacts", { enumerable: true, get: function () { return contacts_js_1.Contacts; } });
__exportStar(require("./types.cjs"), exports);
//# sourceMappingURL=index.js.map