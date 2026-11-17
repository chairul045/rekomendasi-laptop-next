export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Top slim animated loading bar (non-blocking, 60fps) */}
      <div className="h-[3px] w-full bg-gradient-to-r from-violet-600 via-cyan-400 to-indigo-600 animate-[loadingBar_1.2s_ease-in-out_infinite] shadow-[0_0_12px_rgba(6,182,212,0.8)]" />

      {/* Subtle top-right glowing indicator */}
      <div className="absolute top-3 right-4 sm:right-8 bg-zinc-900/90 border border-white/10 rounded-full px-3 py-1 flex items-center gap-2 shadow-lg backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-[10px] font-mono text-zinc-300">Memuat...</span>
      </div>

      <style>{`
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
