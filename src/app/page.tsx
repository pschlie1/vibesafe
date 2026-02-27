import Link from "next/link";

export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { NewAppForm } from "@/components/new-app-form";

export default async function Home() {
  const apps = await db.monitoredApp.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      monitorRuns: {
        orderBy: { startedAt: "desc" },
        include: { findings: true },
        take: 1,
      },
    },
  });

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">VibeSafe</h1>
          <p className="text-gray-600">Continuous health + security monitoring for AI-built apps.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[360px_1fr]">
        <NewAppForm />

        <section className="rounded-lg border p-4">
          <h2 className="mb-4 text-xl font-semibold">Portfolio status</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2">App</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Last check</th>
                  <th className="p-2">Latest findings</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => {
                  const run = app.monitorRuns[0];
                  return (
                    <tr key={app.id} className="border-b">
                      <td className="p-2 font-medium">{app.name}</td>
                      <td className="p-2">{app.status}</td>
                      <td className="p-2">{app.lastCheckedAt?.toLocaleString() ?? "Never"}</td>
                      <td className="p-2">{run ? run.findings.length : 0}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <form action={`/api/scan/${app.id}`} method="post">
                            <button className="rounded border px-2 py-1">Run scan</button>
                          </form>
                          <Link className="rounded border px-2 py-1" href={`/apps/${app.id}`}>
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
