# The Security Checklist for Apps Built with Cursor, Lovable, and Replit

You shipped a new internal tool in three hours using an AI coding assistant. Before it goes to more than a handful of users, run through this list. Each item takes under 10 minutes to check and under an hour to fix.

---

## Headers (5 minutes to check)

Open your browser DevTools, load the app, and look at the response headers on any page request.

**You need all of these:**

| Header | What it does | What bad looks like |
|--------|-------------|---------------------|
| `Content-Security-Policy` | Restricts what scripts run on your page | Missing entirely |
| `Strict-Transport-Security` | Forces HTTPS, prevents downgrade attacks | Missing or max-age < 31536000 |
| `X-Frame-Options` | Prevents your app being embedded in iframes | Missing (clickjacking risk) |
| `X-Content-Type-Options` | Prevents MIME type sniffing | Missing |
| `Referrer-Policy` | Controls what URL is sent in the Referer header | Missing |

AI-generated apps fail 3-5 of these by default. They are one-line fixes in your framework's middleware.

For Next.js, add to `next.config.js`:
```javascript
headers: async () => [{
  source: '/(.*)',
  headers: [
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  ]
}]
```

---

## API Keys and Secrets (10 minutes to check)

This is the highest-severity issue in AI-generated apps. Cursor and similar tools frequently hard-code secrets in client-side JavaScript.

**Check your deployed app:**

1. Open DevTools → Sources → look through your JavaScript bundle files
2. Search for strings like `sk_`, `pk_`, `api_key`, `secret`, `token`, `password`
3. Check your `next.config.js` or `vite.config.js` for `NEXT_PUBLIC_` variables — anything with that prefix goes to the browser

**What to do if you find one:**

Revoke the key immediately. Then move it to a server-side environment variable that never reaches the client. If the key needs to be used client-side (e.g. a Stripe publishable key), that is acceptable only if it is the publishable key specifically designed for client use.

---

## Cookies (5 minutes to check)

In DevTools → Application → Cookies, check every cookie your app sets.

Each cookie should have:
- `Secure` — only sent over HTTPS
- `HttpOnly` — not accessible from JavaScript (prevents XSS stealing sessions)
- `SameSite=Strict` or `SameSite=Lax` — prevents CSRF

If your session cookie lacks `HttpOnly`, any XSS vulnerability in your app gives an attacker your users' sessions.

---

## Authentication Patterns (15 minutes to review)

AI coding tools generate authentication that works — but often works in the wrong place.

**Check for client-side-only auth:**
```javascript
// This is wrong — the UI hides the button but the route is still accessible
if (user.role !== 'admin') {
  return null; // hides the admin panel in the UI
}

// This is right — the server checks the role
const session = await getSession();
if (session.role !== 'admin') {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}
```

Verify every sensitive route has a server-side session check, not just a UI-level conditional.

---

## SSL Certificate (2 minutes)

Go to `https://yourapp.com` and click the padlock. Verify:
- Certificate is valid
- Expiry is more than 30 days out
- The domain matches (no wildcard mismatches)

Set up certificate expiry alerts. A lapsed certificate takes your app offline with no warning.

---

## Third-Party Scripts (10 minutes)

View source on your app. List every `<script src="...">` that loads from an external domain. For each one, ask:
- Do you know what this script does?
- Is it loaded from a CDN you control, or directly from a third-party domain?
- If that third-party domain is compromised, what data does it have access to?

AI-generated apps frequently include analytics scripts, chat widgets, and font loaders that were not explicitly requested. Remove anything you do not recognize.

---

## What to Do After This Checklist

Run it monthly. Keep a record of when you ran it and what you found. That record is your evidence of continuous monitoring for SOC2 and ISO27001 audits.

If you have more than five apps, manual monthly checks do not scale. Automated external scanning — where a tool checks every app on a schedule without needing access to your code or infrastructure — is the practical alternative.

---

*Scantient runs this checklist automatically against every app in your portfolio, on a schedule, with alerts when something changes. No SDK installation. Register a URL and get results in 60 seconds.*
