# Scantient — First 90 Days Go-to-Market Plan

*This is the path from $0 to first $10k MRR.*

---

## The Founding Insight

IT leaders at mid-market companies are personally accountable for apps their developers ship using AI tools — but have zero visibility into whether those apps are safe. They feel this pain acutely during audits, insurance renewals, and security reviews. They do not yet know Scantient exists.

The job of the first 90 days: find 20-30 of these people, give them the product, and convert 10-15 to paying customers.

---

## Days 1-30: Find the Pain

### Goal
10 discovery conversations. 3 design partners on free trial.

### Channels

**1. Hacker News**
The Cursor compliance thread (https://news.ycombinator.com/item?id=47043484) has your exact buyer commenting in real time. Post the draft comment in `docs/hn-comment-draft.md`. Engage authentically. Do not pitch — answer the question. People who upvote or reply are warm leads.

**2. Reddit**
- r/sysadmin — post "How are you handling security reviews for AI-generated internal tools?" — genuine question, genuine answer, mention Scantient at the end with disclosure
- r/msp — "Any MSPs monitoring AI-generated apps across client orgs?" — direct pitch to MSPs, who have the most acute pain

**3. LinkedIn**
Search: "IT Director" OR "CISO" + "Cursor" OR "Lovable" OR "vibe coding". Connect with a personalized note referencing their post or company. Use Template 1 from `docs/outreach/design-partner-email.md`.

**4. Cold email**
Target: IT Directors at PE-backed companies with 150-500 employees. These companies:
- Have compliance requirements (SOC2, PE firm demands it)
- Have developers adopting AI tools fast
- Have IT leaders who are accountable but under-resourced
- Have budget (PE-backed = funded)

Use data from LinkedIn Sales Navigator or Apollo.io.

**5. Free score tool**
Share `https://scantient.com/score?url=YOUR_APP_URL` in relevant communities. Let the tool do the talking. When it finds a CRITICAL issue, people share it.

### Metrics for Days 1-30
- 10 discovery calls booked
- 3 organizations on free trial (any tier)
- 50 free score scans run
- 1 piece of content published (use the blog drafts in `docs/blog/`)

---

## Days 31-60: Convert and Learn

### Goal
3 paying customers. $1,500-$4,000 MRR. 1 case study or quote.

### Tactics

**Convert free trials**
Any organization that has scanned 5+ apps and seen findings is a conversion candidate. Schedule a 30-minute call. Walk through their findings. Show the compliance score. Ask: "If you had to do a SOC2 audit today, would you want this evidence?"

**The compliance close**
The strongest close for $399-$1,500/mo: "Your auditor will ask for continuous monitoring evidence. This gives you that evidence automatically, without asking your developers to do anything." Compliance budget is different from IT budget — it is easier to approve.

**The PagerDuty close (ENTERPRISE)**
For organizations with an on-call rotation: "When one of these apps goes critical at 2am, who finds out? Right now the answer is no one." PagerDuty integration + $1,500/mo is an easy approval for a CISO who has been paged about an unrelated incident recently.

**Ask for referrals**
Every person you talk to knows 5 more IT Directors. After any positive conversation — paid or not — ask: "Who else do you know managing AI app sprawl like this?"

### Metrics for Days 31-60
- 3 paying customers (target mix: 2 Pro, 1 Enterprise)
- Average contract value > $500/mo
- 1 written testimonial or LinkedIn recommendation
- NPS from trial users: understand why they did/did not convert

---

## Days 61-90: Find the Pattern

### Goal
$8,000-$12,000 MRR. Identify which channel/ICP converts best. Build one repeatable motion.

### The bet
By day 60, you will know which of these is true:
1. **Compliance buyers convert best** → Double down on SOC2/audit-prep messaging, content, and outreach
2. **Security-conscious developers convert** → Focus on GitHub integration, developer-facing content, free score virality
3. **MSPs convert best** → Prioritize MSP mode (build it), target MSP-specific communities

Pick the one that's working and ignore the others until $50k MRR.

### Content engine
Publish the two blog posts from `docs/blog/` to a Scantient blog. These target high-intent searches:
- "How to govern AI-generated apps" → SOC2 buyers
- "Security checklist for Cursor Lovable Replit apps" → developers who will share with their IT leaders

Add one post per week. Each post ends with a link to the free score tool.

### Pricing experiment
At day 60, consider: is $199 Starter converting, or are prospects going straight to Pro? If Starter is rarely purchased, remove it and make Pro the entry point at $299/mo. Simplicity converts better than choice.

---

## What Success Looks Like at Day 90

| Metric | Target |
|--------|--------|
| MRR | $8,000-$12,000 |
| Paying customers | 10-15 |
| Free trials active | 20-30 |
| Free score scans/week | 100+ |
| Discovery calls conducted | 30+ |
| Dominant channel identified | Yes |
| Case study published | 1 |

At $10k MRR you have product-market fit signal. The product works, someone pays for it, and you know who they are. Everything after that is scaling what works.

---

## The Single Most Important Thing

Get 3 people to pay before optimizing anything.

Not the landing page. Not the onboarding flow. Not the pricing tiers. Talk to humans, show them the product, ask for money. The feedback from those 3 conversations is worth more than anything else you can do in 90 days.
