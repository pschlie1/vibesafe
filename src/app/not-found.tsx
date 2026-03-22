import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-page px-4 text-center">
      <h1 className="text-6xl font-bold text-white">404</h1>
      <p className="mt-4 text-lg text-muted">
        This page doesn&apos;t exist.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-hover"
        >
          Go Home
        </Link>
        <Link
          href="/score"
          className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-muted transition hover:border-border-subtle hover:text-body"
        >
          Free Security Scan
        </Link>
      </div>
    </div>
  );
}
