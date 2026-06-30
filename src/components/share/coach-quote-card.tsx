import { BookOpen } from "lucide-react";
import type { Language } from "@/i18n/types";
import { ShareCardRenderer } from "./share-card-renderer";

interface CoachQuoteCardProps {
  lesson: string;
  raceTitle: string;
  grade: string;
  lang: Language;
  date: string;
}

export function CoachQuoteCard({
  lesson,
  raceTitle,
  grade,
  lang,
  date,
}: CoachQuoteCardProps) {
  return (
    <ShareCardRenderer
      date={date}
      headerTitle={
        lang === "id" ? "RunQuest Pelajaran Pelatih" : "RunQuest Coaching Tip"
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {lang === "id" ? "Kata Pelatih RunQuest:" : "RunQuest Coach Says:"}
          </h2>
          <p className="text-xs text-slate-400 mt-1 truncate">
            {raceTitle} — Grade {grade}
          </p>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 relative min-h-[160px] flex items-center justify-center">
          {/* Big quotes styling in background */}
          <span className="absolute top-2 left-4 text-7xl font-serif text-indigo-500/10 pointer-events-none select-none">
            “
          </span>
          <span className="absolute bottom-[-10px] right-4 text-7xl font-serif text-indigo-500/10 pointer-events-none select-none">
            ”
          </span>

          <p className="text-lg font-bold text-center leading-relaxed text-slate-100 px-6 italic">
            {lesson}
          </p>
        </div>

        <p className="text-xs text-slate-500 italic text-center">
          Learn, adapt, and run stronger next time.
        </p>
      </div>
    </ShareCardRenderer>
  );
}
