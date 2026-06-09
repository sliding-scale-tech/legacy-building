import privacyHtml from "./privacy-policy.html?raw";

import { sanitizeTermlyHtml } from "./sanitize-termly-html";

export const PRIVACY_POLICY_HTML = sanitizeTermlyHtml(privacyHtml);
