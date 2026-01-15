"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contacts = void 0;
class Contacts {
    http;
    constructor(http) {
        this.http = http;
    }
    async create(options) {
        const response = await this.http.post("/contacts", options);
        if (response.success && response.data) {
            return {
                success: true,
                data: response.data,
            };
        }
        return {
            success: false,
            error: response.error,
        };
    }
    async get(id) {
        const response = await this.http.get(`/contacts/${id}`);
        if (response.success && response.data) {
            return {
                success: true,
                data: response.data,
            };
        }
        return {
            success: false,
            error: response.error,
        };
    }
    async delete(id) {
        const response = await this.http.delete(`/contacts/${id}`);
        if (response.success) {
            return { success: true };
        }
        return {
            success: false,
            error: response.error,
        };
    }
    async upsert(options) {
        const response = await this.http.post("/contacts/email", options);
        if (response.success && response.data) {
            return {
                success: true,
                data: response.data,
            };
        }
        return {
            success: false,
            error: response.error,
        };
    }
}
exports.Contacts = Contacts;
//# sourceMappingURL=contacts.js.map