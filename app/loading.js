export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center gap-4 bg-[#0a0a0c]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/30">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
        Loading
      </span>
    </div>
  );
}
