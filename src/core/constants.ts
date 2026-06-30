export const ERROR_MESSAGES = {
  unknownError: "Unknown error",
  reactRenderError:
    "Failed to render React component. Make sure to install `@react-email/render` or `@react-email/components`.",
  missingApiKey:
    "Missing API key. Pass it to the constructor or set the RESEND_API_KEY environment variable.",
  atLeastOneRecipient: "At least one recipient is required",
  requestTimeout: "Request timeout",
  contactNotFound: "Contact not found",
  contactIdRequiredLookup:
    "Contact ID is required. Email-based lookup is not supported.",
  contactIdRequiredRemoval:
    "Contact ID is required. Email-based removal is not supported.",
  emailRequiredUpdate: "Email is required for update",
  unsupportedTags: "Autosend: tags are not supported and will be ignored",
  unsupportedAttachments: "Autosend: attachments are not currently supported",
  unsupportedHeaders:
    "Autosend: custom headers are not supported and will be ignored",
  unsupportedScheduledAt:
    "Autosend: scheduledAt is not supported and will be ignored",
  recipientLimitExceeded: (count: number, max: number) =>
    `Recipient count ${count} exceeds maximum of ${max}. Split into multiple bulk() calls.`,
  httpStatusError: (status: number) => `HTTP ${status}`,
} as const;
