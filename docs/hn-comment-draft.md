# Draft HN Comment
# Thread: "Ask HN: How do companies that use Cursor handle compliance?"
# https://news.ycombinator.com/item?id=47043484

---

## DRAFT (review before posting . follows HN norms, no promotion without disclosure)

The Cursor compliance question (HIPAA BAA, FedRAMP) is separate from the compliance question about the apps Cursor builds. Both matter, but regulated companies often conflate them.

The BAA/FedRAMP problem is about data sent to Cursor's servers during development . your code, your prompts, your context windows. The answer there is usually: use Cursor Business with a zero data retention agreement, keep sensitive data out of context, or use a self-hosted model.

The harder problem is the output. Cursor ships apps in hours that would previously take weeks. Those apps go into production without the security review that slower development would have caught. Common defaults in AI-generated code: no Content-Security-Policy header, session cookies without HttpOnly/Secure flags, API keys in client-side JavaScript, third-party scripts from unvetted sources.

SOC2 auditors are starting to ask about AI-generated apps specifically. CC6.1 (logical access controls) and A1.1/A1.2 (availability monitoring) apply regardless of how the app was built.

Practical approach that works without slowing developers down: continuous external scanning of every deployed app, no SDK installation required, alerts to the app owner when something fails baseline. The scan runs from outside, same as an attacker would approach it. Findings get a plain-language explanation and a specific fix, not a CVE number.

---

*Note for Peter: Post this as yourself, not as Scantient. Add "I've been building in this space" at the end only if you want to disclose. The comment adds genuine value to the thread regardless . the Cursor compliance angle and the app output angle are genuinely separate and worth distinguishing.*
