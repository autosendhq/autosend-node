import { mapHttpStatusToResendError } from "./transforms.mjs";
export class ContactsAdapter {
    client;
    constructor(client) {
        this.client = client;
    }
    async create(options) {
        try {
            const response = await this.client.contacts.create({
                email: options.email,
                firstName: options.firstName,
                lastName: options.lastName,
            });
            if (response.success && response.data) {
                return {
                    data: {
                        id: response.data.id,
                        email: response.data.email,
                        firstName: response.data.firstName ?? null,
                        lastName: response.data.lastName ?? null,
                        createdAt: response.data.createdAt,
                        unsubscribed: false,
                    },
                    error: null,
                };
            }
            return {
                data: null,
                error: mapHttpStatusToResendError(500, response.error ?? "Unknown error"),
            };
        }
        catch (err) {
            return {
                data: null,
                error: {
                    name: "api_error",
                    message: err instanceof Error ? err.message : "Unknown error",
                },
            };
        }
    }
    async get(_audienceId, id) {
        try {
            const response = await this.client.contacts.get(id);
            if (response.success && response.data) {
                return {
                    data: {
                        id: response.data.id,
                        email: response.data.email,
                        firstName: response.data.firstName ?? null,
                        lastName: response.data.lastName ?? null,
                        createdAt: response.data.createdAt,
                        unsubscribed: false,
                    },
                    error: null,
                };
            }
            return {
                data: null,
                error: mapHttpStatusToResendError(404, response.error ?? "Contact not found"),
            };
        }
        catch (err) {
            return {
                data: null,
                error: {
                    name: "api_error",
                    message: err instanceof Error ? err.message : "Unknown error",
                },
            };
        }
    }
    async update(_audienceId, _id, options) {
        // Note: Autosend uses upsert pattern
        try {
            if (!options.email) {
                return {
                    data: null,
                    error: {
                        name: "validation_error",
                        message: "Email is required for update",
                    },
                };
            }
            const response = await this.client.contacts.upsert({
                email: options.email,
                firstName: options.firstName,
                lastName: options.lastName,
            });
            if (response.success && response.data) {
                return {
                    data: {
                        id: response.data.id,
                        email: response.data.email,
                        firstName: response.data.firstName ?? null,
                        lastName: response.data.lastName ?? null,
                        createdAt: response.data.createdAt,
                        unsubscribed: options.unsubscribed ?? false,
                    },
                    error: null,
                };
            }
            return {
                data: null,
                error: mapHttpStatusToResendError(500, response.error ?? "Unknown error"),
            };
        }
        catch (err) {
            return {
                data: null,
                error: {
                    name: "api_error",
                    message: err instanceof Error ? err.message : "Unknown error",
                },
            };
        }
    }
    async remove(_audienceId, id) {
        try {
            const response = await this.client.contacts.delete(id);
            if (response.success) {
                return {
                    data: { deleted: true },
                    error: null,
                };
            }
            return {
                data: null,
                error: mapHttpStatusToResendError(500, response.error ?? "Unknown error"),
            };
        }
        catch (err) {
            return {
                data: null,
                error: {
                    name: "api_error",
                    message: err instanceof Error ? err.message : "Unknown error",
                },
            };
        }
    }
}
//# sourceMappingURL=contacts.js.map