import { forwardRef } from "react";

interface ShareCardRendererProps {
  date?: string;
  headerTitle?: string;
  children: React.ReactNode;
}

export const ShareCardRenderer = forwardRef<
  HTMLDivElement,
  ShareCardRendererProps
>(({ date, headerTitle = "RunQuest Daily Challenge", children }, ref) => {
  return (
    <div
      ref={ref}
      className="w-[800px] h-[450px] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-slate-800 rounded-3xl p-10 text-white relative overflow-hidden flex flex-col justify-between select-none"
    >
      {/* Decorative gradients */}
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start z-10">
        <div>
          <span className="text-[12px] font-extrabold uppercase tracking-widest text-indigo-400">
            {headerTitle}
          </span>
        </div>
        {date && (
          <div className="text-[12px] font-mono text-slate-400 bg-slate-800/40 border border-slate-700/50 rounded-full px-4 py-1.5 z-10">
            {date}
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="flex-grow flex flex-col justify-center my-4 z-10">
        {children}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end border-t border-slate-800 pt-6 z-10">
        <div className="text-xs text-slate-500">
          Play offline-first at runquest.game
        </div>
        <div className="text-lg font-black text-indigo-400 tracking-tight">
          runquest.game
        </div>
      </div>
    </div>
  );
});

ShareCardRenderer.displayName = "ShareCardRenderer";
