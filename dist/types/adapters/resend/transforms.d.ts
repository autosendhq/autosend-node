import type { EmailAddress, SendEmailOptions as AutosendSendOptions } from "../../core/types.js";
import type { SendEmailOptions as ResendSendOptions, ErrorResponse } from "./types.js";
export declare function parseEmailAddress(input: string): EmailAddress;
export declare function parseEmailAddresses(input: string | string[]): EmailAddress[];
export declare function toAutosendRequest(resendOptions: ResendSendOptions): AutosendSendOptions;
export declare function toResendResponse(autosendResponse: {
    success: boolean;
    data?: {
        emailId: string;
    };
    error?: string;
}): {
    data: {
        id: string;
    } | null;
    error: ErrorResponse | null;
};
export declare function mapHttpStatusToResendError(status: number, message: string): ErrorResponse;
export interface BulkSendRequest {
    from: EmailAddress;
    subject: string;
    html?: string;
    text?: string;
    replyTo?: EmailAddress;
    recipients: EmailAddress[];
}
export declare function toAutosendBulkRequest(resendOptions: ResendSendOptions): BulkSendRequest;
//# sourceMappingURL=transforms.d.ts.map