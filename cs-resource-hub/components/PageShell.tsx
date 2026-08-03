import TopBar from './TopBar';

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas-bg)]">
      <TopBar />
      <main className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full">{children}</main>
    </div>
  );
}
