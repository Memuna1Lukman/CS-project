import TopBar from './TopBar';
import BottomNav from './BottomNav';
import AdminSidebar from './AdminSidebar';

export default function AdminPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <TopBar />
      <div className="flex flex-1 items-start">
        <AdminSidebar />
        <main className="flex-1 min-w-0 p-4 sm:p-6 pb-24 md:pb-6 max-w-4xl mx-auto w-full">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
