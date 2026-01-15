"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEmailAddress = parseEmailAddress;
exports.parseEmailAddresses = parseEmailAddresses;
exports.toAutosendRequest = toAutosendRequest;
exports.toResendResponse = toResendResponse;
exports.mapHttpStatusToResendError = mapHttpStatusToResendError;
exports.toAutosendBulkRequest = toAutosendBulkRequest;
function parseEmailAddress(input) {
    const match = input.match(/^(.+?)\s*<(.+)>$/);
    if (match) {
        return { name: match[1].trim(), email: match[2].trim() };
    }
    return { email: input.trim() };
}
function parseEmailAddresses(input) {
    const addresses = Array.isArray(input) ? input : [input];
    return addresses.map(parseEmailAddress);
}
function toAutosendRequest(resendOptions) {
    const to = parseEmailAddresses(resendOptions.to);
    const request = {
        from: parseEmailAddress(resendOptions.from),
        to: to.length === 1 ? to[0] : to,
        subject: resendOptions.subject,
    };
    if (resendOptions.html) {
        request.html = resendOptions.html;
    }
    if (resendOptions.text) {
        request.text = resendOptions.text;
    }
    if (resendOptions.cc) {
        request.cc = parseEmailAddresses(resendOptions.cc);
    }
    if (resendOptions.bcc) {
        request.bcc = parseEmailAddresses(resendOptions.bcc);
    }
    if (resendOptions.replyTo) {
        const replyTos = parseEmailAddresses(resendOptions.replyTo);
        request.replyTo = replyTos[0];
    }
    return request;
}
function toResendResponse(autosendResponse) {
    if (autosendResponse.success && autosendResponse.data) {
        return {
            data: { id: autosendResponse.data.emailId },
            error: null,
        };
    }
    return {
        data: null,
        error: {
            message: autosendResponse.error ?? "Unknown error",
            name: "api_error",
        },
    };
}
function mapHttpStatusToResendError(status, message) {
    const errorMap = {
        400: "validation_error",
        401: "missing_api_key",
        403: "invalid_api_key",
        404: "not_found",
        422: "validation_error",
        429: "rate_limit_exceeded",
        500: "internal_server_error",
    };
    return {
        name: errorMap[status] ?? "application_error",
        message,
        statusCode: status,
    };
}
function toAutosendBulkRequest(resendOptions) {
    const recipients = parseEmailAddresses(resendOptions.to);
    const request = {
        from: parseEmailAddress(resendOptions.from),
        subject: resendOptions.subject,
        recipients,
    };
    if (resendOptions.html) {
        request.html = resendOptions.html;
    }
    if (resendOptions.text) {
        request.text = resendOptions.text;
    }
    if (resendOptions.replyTo) {
        const replyTos = parseEmailAddresses(resendOptions.replyTo);
        request.replyTo = replyTos[0];
    }
    return request;
}
//# sourceMappingURL=transforms.js.map