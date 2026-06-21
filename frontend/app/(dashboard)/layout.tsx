import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { UserSync } from "@/components/auth/UserSync";
import { CurrencyTicker } from "@/components/layout/CurrencyTicker";
import { ToastProvider } from "@/components/ui/Toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <UserSync />
      {/* Currency ticker — full width above main content */}
      <CurrencyTicker />
      <div className="flex flex-1 h-full overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-y-auto pb-16 lg:pb-0">
          <Breadcrumbs />
          {children}
        </main>
      </div>
      <BottomNav />
    </ToastProvider>
  );
}
