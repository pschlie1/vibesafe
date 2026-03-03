import { Nav } from "@/components/nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-alabaster-grey-50">
      <Nav />
      {children}
    </div>
  );
}
