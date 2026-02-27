import Link from "next/link";

export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export default async function AppDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = await db.monitoredApp.findUnique({
    where: { id },
    include: {
      monitorRuns: {
        orderBy: { startedAt: "desc" },
        include: { findings: true },
      },
    },
  });

  if (!app) notFound();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link className="mb-4 inline-block text-sm underline" href="/">
        ← Back
      </Link>
      <h1 className="text-2xl font-bold">{app.name}</h1>
      <p className="text-gray-600">{app.url}</p>

      <section className="mt-6 space-y-4">
        {app.monitorRuns.map((run) => (
          <div key={run.id} className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="font-semibold">{run.status}</p>
                <p className="text-sm text-gray-500">{run.startedAt.toLocaleString()}</p>
              </div>
              <p className="text-sm">{run.responseTimeMs ?? "-"} ms</p>
            </div>
            <p className="mb-2 text-sm">{run.summary}</p>
            <ul className="space-y-2 text-sm">
              {run.findings.map((f) => (
                <li key={f.id} className="rounded bg-gray-50 p-2">
                  <p className="font-medium">[{f.severity}] {f.title}</p>
                  <p>{f.description}</p>
                  <pre className="mt-2 overflow-x-auto rounded bg-black p-2 text-xs text-white">{f.fixPrompt}</pre>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}
