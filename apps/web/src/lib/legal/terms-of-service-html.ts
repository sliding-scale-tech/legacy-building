import { sanitizeTermlyHtml } from "./sanitize-termly-html";
import termsHtml from "./terms-of-service.html?raw";

export const TERMS_OF_SERVICE_HTML = sanitizeTermlyHtml(termsHtml);
