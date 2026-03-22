import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "GraphQL Security: The Unique Vulnerabilities API Builders Miss | Scantient Blog",
  description:
    "GraphQL introduces unique security risks REST APIs don't have. Introspection attacks, batching abuse, depth limiting, query complexity . what they are and how to fix them before launch.",
  keywords: "GraphQL security, GraphQL API vulnerabilities, GraphQL introspection attack, GraphQL rate limiting, GraphQL depth limiting, secure GraphQL API",
  openGraph: {
    title: "GraphQL Security: The Unique Vulnerabilities API Builders Miss",
    description:
      "GraphQL's flexibility is its biggest feature and its biggest security risk. Introspection attacks, batching abuse, unbounded queries, and query complexity . the vulnerabilities REST developers overlook.",
    url: "https://scantient.com/blog/graphql-security-guide",
    siteName: "Scantient",
    type: "article",
    publishedTime: "2025-11-20T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "GraphQL Security: The Unique Vulnerabilities API Builders Miss",
    description:
      "GraphQL security guide: introspection attacks, batching abuse, depth limiting, and query complexity . the vulnerabilities REST developers miss when switching to GraphQL.",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "GraphQL Security: The Unique Vulnerabilities API Builders Miss",
  description:
    "GraphQL introduces unique security risks REST APIs don't have. Introspection attacks, batching abuse, depth limiting, and query complexity . what they are and how to fix them.",
  datePublished: "2025-11-20T00:00:00Z",
  dateModified: "2025-11-20T00:00:00Z",
  author: { "@type": "Organization", name: "Scantient" },
  publisher: {
    "@type": "Organization",
    name: "Scantient",
    url: "https://scantient.com",
  },
  url: "https://scantient.com/blog/graphql-security-guide",
  mainEntityOfPage: "https://scantient.com/blog/graphql-security-guide",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://scantient.com" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://scantient.com/blog" },
    {
      "@type": "ListItem",
      position: 3,
      name: "GraphQL Security: The Unique Vulnerabilities API Builders Miss",
      item: "https://scantient.com/blog/graphql-security-guide",
    },
  ],
};

export default function GraphqlSecurityGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <article className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Link
              href="/blog"
              className="text-sm text-dusty-denim-600 hover:text-prussian-blue-600 transition-colors"
            >
              ← Blog
            </Link>
            <span className="text-sm text-dusty-denim-400">/</span>
            <span className="rounded-full bg-violet-100 dark:bg-violet-900/30 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700">
              API Security
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">
            GraphQL Security: The Unique Vulnerabilities API Builders Miss
          </h1>
          <p className="mt-4 text-lg text-dusty-denim-700 dark:text-dusty-denim-400">
            GraphQL&apos;s flexibility is its biggest feature . and its biggest security risk. Developers
            who switch from REST often carry over REST-era assumptions that leave their GraphQL APIs
            wide open to attacks that simply don&apos;t exist in REST.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm text-dusty-denim-500">
            <time dateTime="2025-11-20">November 20, 2025</time>
            <span>·</span>
            <span>10 min read</span>
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none">

          <p>
            GraphQL gives clients unprecedented flexibility to query exactly the data they need.
            That flexibility is the entire point . and it&apos;s also why GraphQL security requires a
            fundamentally different approach than securing a REST API. The same features that make
            GraphQL powerful create attack surfaces that REST never had.
          </p>
          <p>
            This guide covers the GraphQL-specific vulnerabilities that developers commonly miss
            when building their first GraphQL API, and the concrete defenses for each one.
          </p>

          <h2>Why GraphQL Security Is Different</h2>
          <p>
            In a REST API, your attack surface is relatively well-defined: a list of routes, each
            with a specific method and expected parameters. An attacker probing a REST API must
            enumerate routes and test each one.
          </p>
          <p>
            In GraphQL, a single endpoint (<code>/graphql</code>) handles all queries. The schema
            defines every possible query, mutation, and type . and by default, GraphQL is designed
            to tell you exactly what that schema contains. A single query can traverse multiple
            relationships, request any combination of fields, and retrieve far more data than any
            individual REST endpoint would return.
          </p>
          <p>
            This design philosophy . powerful, self-describing, flexible . is what makes GraphQL
            great and what makes it dangerous when default configurations are left in place.
          </p>

          <h2>1. Introspection Attacks</h2>
          <p>
            GraphQL introspection is a built-in feature that allows clients to query the API&apos;s
            schema . every type, every field, every query, and every mutation . in a single request.
            It&apos;s essential for developer tooling and API documentation.
          </p>
          <p>
            It&apos;s also a complete map of your API for an attacker.
          </p>
          <p>
            With introspection enabled in production, an attacker can run:
          </p>
          <pre><code>{`{
  __schema {
    types {
      name
      fields {
        name
        type { name }
      }
    }
  }
}`}</code></pre>
          <p>
            This returns every type and field in your schema, including admin mutations,
            internal types, deprecated fields that still work, and relationships between objects
            that reveal your data model. It&apos;s the equivalent of a REST API returning a complete
            route listing with parameters . except it&apos;s a feature, not a bug, and it&apos;s enabled by
            default in virtually every GraphQL server.
          </p>
          <p><strong>Defense:</strong></p>
          <ul>
            <li>Disable introspection in production. Apollo Server: <code>introspection: false</code>. This is one line of configuration.</li>
            <li>If you need introspection for internal tooling, restrict it by IP or authenticated role.</li>
            <li>Consider disabling field suggestions (the &quot;Did you mean X?&quot; error messages) . they leak schema information even without introspection.</li>
          </ul>

          <h2>2. Batching Attacks</h2>
          <p>
            GraphQL supports query batching . sending multiple queries in a single HTTP request.
            This is a legitimate performance optimization for clients that need to fetch multiple
            resources simultaneously.
          </p>
          <p>
            It&apos;s also a way to amplify brute force attacks by a factor of 100 while appearing as
            a single HTTP request to rate limiters that operate at the HTTP layer.
          </p>
          <p>
            A classic attack: send a single batched request containing 100 login mutations with
            different password guesses. Your HTTP-level rate limiter sees 1 request. Your login
            function executes 100 times. Standard rate limiting is completely bypassed.
          </p>
          <p><strong>Defense:</strong></p>
          <ul>
            <li>Limit batch size at the server level . reject batches larger than a defined threshold (e.g., 10 operations).</li>
            <li>Apply rate limiting at the GraphQL operation level, not just the HTTP request level.</li>
            <li>Consider disabling batching entirely if your clients don&apos;t need it.</li>
            <li>Implement per-field rate limiting on sensitive operations like authentication mutations.</li>
          </ul>

          {/* Inline CTA */}
          <div className="not-prose my-8 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-6 text-center">
            <p className="font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
              Check your API&apos;s security posture in 60 seconds
            </p>
            <p className="mt-1 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
              Scantient scans your live API for exposed headers, TLS misconfiguration, and other
              security gaps . no code access required.
            </p>
            <Link
              href="/score"
              className="mt-4 inline-block rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Scan Your API Free →
            </Link>
          </div>

          <h2>3. Query Depth Attacks (Nested Query DoS)</h2>
          <p>
            GraphQL&apos;s relational data model allows queries to traverse object relationships
            arbitrarily. If your schema has a <code>User</code> type with a <code>friends</code>{" "}
            field that returns more <code>User</code> types, a malicious query can nest this
            infinitely:
          </p>
          <pre><code>{`{
  user(id: "1") {
    friends {
      friends {
        friends {
          friends {
            # ... 50 more levels
          }
        }
      }
    }
  }
}`}</code></pre>
          <p>
            A single query like this can cause your server to execute an exponentially large
            number of database queries, exhausting resources and causing a denial of service.
            Unlike a DDoS attack, this requires only a single HTTP request.
          </p>
          <p><strong>Defense:</strong></p>
          <ul>
            <li>
              Implement query depth limiting. Libraries like <code>graphql-depth-limit</code>
              (Node.js) allow you to set a maximum depth (e.g., 10 levels) and reject queries
              that exceed it.
            </li>
            <li>
              Set a hard limit appropriate to your schema . most legitimate client queries
              don&apos;t need more than 5–7 levels of nesting.
            </li>
            <li>
              Log and alert on queries that hit the depth limit . they&apos;re almost always either
              attacks or bugs.
            </li>
          </ul>

          <h2>4. Query Complexity Attacks</h2>
          <p>
            Depth limiting alone isn&apos;t sufficient. A shallow but extremely wide query can be just
            as expensive:
          </p>
          <pre><code>{`{
  products(first: 10000) {
    id name description price category
    reviews(first: 10000) { id text author rating }
    variants(first: 10000) { id color size stock }
  }
}`}</code></pre>
          <p>
            This query is only 3 levels deep but could return millions of database rows. A depth
            limit of 10 would allow this query through completely.
          </p>
          <p><strong>Defense:</strong></p>
          <ul>
            <li>
              Implement query complexity analysis. Assign a cost to each field (simple fields:
              1, list fields: higher costs based on expected cardinality) and reject queries
              that exceed a total complexity budget.
            </li>
            <li>
              Libraries like <code>graphql-query-complexity</code> handle this calculation
              automatically with configurable field cost definitions.
            </li>
            <li>
              Set pagination limits on all list fields . never allow{" "}
              <code>first: 10000</code> without a cap.
            </li>
            <li>
              Consider query timeouts as a backstop . reject any query that takes longer
              than a defined threshold to execute.
            </li>
          </ul>

          <h2>5. Authorization at the Resolver Level</h2>
          <p>
            REST APIs typically enforce authorization at the route level . a middleware checks
            whether the authenticated user can access this endpoint. In GraphQL, the same endpoint
            handles all queries, which means authorization must be enforced at the resolver level
            for each field.
          </p>
          <p>
            This is where many GraphQL APIs have critical vulnerabilities: a developer adds
            authentication to the GraphQL endpoint but forgets that individual resolvers need
            their own authorization checks. An authenticated user who can query{" "}
            <code>{"me { id email }"}</code> shouldn&apos;t be able to query{" "}
            <code>{"user(id: \"admin\") { id email role }"}</code>.
          </p>
          <p><strong>Defense:</strong></p>
          <ul>
            <li>
              Implement field-level authorization in every resolver that returns sensitive data.
              Never assume that authenticating the request is sufficient.
            </li>
            <li>
              Use a schema authorization library like <code>graphql-shield</code> to define
              authorization rules declaratively and apply them consistently.
            </li>
            <li>
              Test authorization by running queries as a low-privilege user and attempting to
              access admin-only fields. This is the GraphQL equivalent of IDOR testing.
            </li>
          </ul>

          <h2>6. Mutation Rate Limiting and CSRF</h2>
          <p>
            Mutations . GraphQL&apos;s equivalent of POST/PUT/DELETE . can be vulnerable to CSRF if
            your API accepts simple content types or cookies for authentication. While most modern
            GraphQL APIs use token-based auth that naturally prevents CSRF, any API that accepts
            <code>application/x-www-form-urlencoded</code> or <code>text/plain</code> content
            types may be vulnerable.
          </p>
          <p><strong>Defense:</strong></p>
          <ul>
            <li>Accept only <code>application/json</code> content type for GraphQL requests.</li>
            <li>Use authorization headers (Bearer tokens) rather than cookies for API authentication.</li>
            <li>If cookies are required, implement CSRF tokens on all mutation operations.</li>
          </ul>

          <h2>GraphQL Security Checklist</h2>
          <ul>
            <li>✅ Introspection disabled in production</li>
            <li>✅ Field suggestions disabled (or restricted to authenticated users)</li>
            <li>✅ Batch query size limited (max 10 operations per request)</li>
            <li>✅ Query depth limit implemented (recommend max 10 levels)</li>
            <li>✅ Query complexity analysis and budget enforcement</li>
            <li>✅ Pagination limits on all list fields</li>
            <li>✅ Field-level authorization in all resolvers returning sensitive data</li>
            <li>✅ Per-operation rate limiting (not just HTTP-level)</li>
            <li>✅ Only <code>application/json</code> content type accepted</li>
            <li>✅ Error messages don&apos;t expose internal schema details</li>
            <li>✅ Query timeout implemented as a backstop</li>
          </ul>

          <p>
            For a broader view of API security vulnerabilities beyond GraphQL-specific issues,
            the{" "}
            <Link href="/blog/api-security-complete-guide" className="text-prussian-blue-600 hover:underline">
              complete API security guide
            </Link>{" "}
            covers the full attack surface. And the{" "}
            <Link href="/blog/7-api-security-mistakes" className="text-prussian-blue-600 hover:underline">
              7 API security mistakes killing startups
            </Link>{" "}
            includes several that apply equally to GraphQL and REST.
          </p>

        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-8 text-center">
          <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">
            Scan Your API Free . 60 Seconds
          </h3>
          <p className="mt-2 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
            Scantient scans your production API externally . no code access, no SDK, no setup.
            Get a security score and actionable findings in under a minute.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/score"
              className="rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Run a free scan now →
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-prussian-blue-300 dark:border-prussian-blue-700 px-6 py-3 text-sm font-semibold text-prussian-blue-700 dark:text-prussian-blue-300 transition hover:bg-prussian-blue-100 dark:hover:bg-prussian-blue-900/40"
            >
              Get lifetime access for $79
            </Link>
          </div>
        </div>

        {/* Related */}
        <div className="mt-12 border-t border-border pt-8">
          <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-4">Related</h3>
          <div className="flex flex-col gap-3">
            <Link
              href="/blog/api-security-complete-guide"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              API Security: The Complete Guide for Developers →
            </Link>
            <Link
              href="/blog/7-api-security-mistakes"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              7 API Security Mistakes Killing Your Startup →
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
