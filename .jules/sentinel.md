## 2024-05-20 - Server-Side Request Forgery (SSRF) via Webhook Registration
**Vulnerability:** The `/api/webhooks/register` endpoint accepted any valid URL for webhook registration, without restricting internal network ranges (localhost, 127.0.0.1, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) or AWS metadata endpoints (169.254.169.254).
**Learning:** This codebase uses webhooks to notify clients, meaning the server actively sends HTTP requests to user-provided URLs. Unvalidated URLs allow an attacker to probe internal networks, access restricted internal APIs, or exfiltrate cloud metadata credentials.
**Prevention:** Webhook URLs must be explicitly validated before being stored. Validate the protocol (http/https) and parse the URL to extract the hostname. Explicitly block loopback addresses, metadata IPs, and internal IP ranges using regex or IP utility libraries before accepting the webhook URL.
## 2024-05-30 - Prevent SSRF in User-Provided Webhooks
**Vulnerability:** The webhook registration endpoint (`/api/webhooks/register`) allowed any valid URL to be registered, exposing an SSRF (Server-Side Request Forgery) vulnerability. An attacker could register a URL pointing to internal services (e.g., `http://localhost:8080/admin`, `http://169.254.169.254/latest/meta-data/`) to port scan or access cloud metadata.
**Learning:** External integration points, particularly webhooks, require strict validation of the target URL to ensure they are external, preventing the application server from making unintended internal HTTP requests.
**Prevention:** Always parse and strictly validate user-provided URLs before accepting them for server-side requests. Enforce `http:`/`https:` protocols, and explicitly deny requests to loopback addresses (`localhost`, `127.0.0.1`, `0.0.0.0`), local domains (`.local`, `.internal`), and cloud metadata IP addresses (`169.254.169.254`).

## 2024-05-31 - Prevent SSRF via HTTP Redirects in Webhooks
**Vulnerability:** Even though webhook URLs were validated during registration against forbidden local and internal hostnames, `axios.post` in `WebhookService.sendWebhook` was configured to follow HTTP redirects by default. An attacker could register a valid external URL (e.g., `http://attacker.com`), which would pass the initial validation. When the server attempted to send the webhook, the attacker's server could respond with an HTTP 302 redirect to an internal IP or cloud metadata service (e.g., `http://169.254.169.254/latest/meta-data/`). `axios` would automatically follow this redirect and fetch the sensitive internal data, which could then be exposed to the attacker via the webhook events API.
**Learning:** URL validation at the time of input is insufficient to prevent SSRF if the HTTP client used to make the request follows redirects. The target of a redirect must also be validated, or redirects must be disabled entirely if not strictly necessary.
**Prevention:** Always configure HTTP clients (like `axios`, `fetch`, etc.) to not follow redirects (`maxRedirects: 0` or equivalent) when making server-to-server requests to user-provided URLs, unless redirect targets are explicitly validated against the same SSRF prevention rules.

## 2024-06-05 - Prevent SSRF via IPv4-mapped IPv6 Addresses
**Vulnerability:** The SSRF protection was incomplete as it only matched `::ffff:` string prefix for IPv4-mapped IPv6 addresses. Alternate representations like `0:0:0:0:0:ffff:127.0.0.1` bypassed this check and bypassed the SSRF filter completely.
**Learning:** String manipulation on IP addresses is insufficient due to multiple valid representations.
**Prevention:** Rely on established IP parsing libraries like `ipaddr.js` and natively convert mapped addresses using `.isIPv4MappedAddress()` and `.toIPv4Address()`.
## 2025-04-24 - [Fix Overly Permissive CORS Configuration]
**Vulnerability:** The Express and Socket.io instances in server/src/index.ts were using an overly permissive CORS configuration allowing all origins (`*`).
**Learning:** The legacy `server/index.js` file correctly used the `CORS_ORIGIN` environment variable, but this was lost when transitioning the running application to TypeScript (`server/src/index.ts`).
**Prevention:** Ensure security middlewares and correct configurations are ported accurately when migrating or rewriting entry points in new languages.
## 2024-05-24 - Missing Security Middlewares in Active Server
**Vulnerability:** The active TypeScript server entrypoint (`server/src/index.ts`) was missing security headers and rate limiting, although they were present in a legacy `server/index.js` file.
**Learning:** Legacy configuration files can drift from active TypeScript implementations, leaving production applications unknowingly vulnerable to common web attacks (e.g., missing XSS protection headers, no rate limiting for brute-force/DoS attacks).
**Prevention:** Ensure that when migrating from JS to TS, all security middleware is explicitly ported over, and establish automated security linting to detect missing baseline protections (like Helmet and Rate Limiting).
## 2024-05-02 - Added Rate Limiting and Security Headers
**Vulnerability:** Missing rate limiting on API endpoints and missing security headers.
**Learning:** The Express application was exposed without rate limits or basic security headers (like HSTS, X-Content-Type-Options), which could lead to DoS or exploitation.
**Prevention:** Always include `helmet` and `express-rate-limit` in the global middleware stack for Express servers to ensure a baseline level of defense in depth.
## 2024-06-10 - Fix SSRF Bypass via IPv4-mapped IPv6 Addresses in Webhook Registration
**Vulnerability:** The webhook registration endpoint's initial SSRF validation used weak regexes that only caught `::ffff:` string prefixes for IPv4-mapped IPv6 addresses, allowing alternate representations (e.g., `0:0:0:0:0:ffff:127.0.0.1`) to bypass the filter and register internal IPs.
**Learning:** String manipulation and regexes are insufficient for validating IP addresses due to multiple valid representations.
**Prevention:** Rely on established IP parsing libraries like `ipaddr.js` to parse and natively evaluate IP addresses, including converting mapped addresses using `.isIPv4MappedAddress()` and `.toIPv4Address()`.
