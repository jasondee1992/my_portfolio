# Chatbot Payload Contract

The `/api/chat` route accepts the normal chat fields plus optional logging metadata.

Supported optional metadata fields:
- `sessionId` or `session_id`
- `visitorId` or `visitor_id`
- `pageUrl` or `page_url`
- `userAgent` or `user_agent`
- `ipAddress` or `ip_address`

All metadata fields are optional.

Normalization rules:
- The route accepts both camelCase and snake_case aliases for the same metadata field.
- Values are normalized into one internal metadata shape before logging.
- `pageUrl` falls back to the request `referer` header when the body does not provide it.
- `userAgent` falls back to the request `user-agent` header when the body does not provide it.
- `ipAddress` prefers request header-derived IP information and only falls back to the body value if no header-based IP is available.

Logging usage:
- `sessionId` groups messages within the same browser tab/session.
- `visitorId` groups messages across repeat visits in the same browser.
- `pageUrl` records the page where the chat request originated.
- `userAgent` records the browser/client identifier.
- `ipAddress` records the best available request IP for local logging.
