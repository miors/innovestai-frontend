import { useEffect, useState } from "react";

// Text between ** markers becomes bold. An unfinished ** while typing still works.
const renderBold = (text) =>
  text.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-violet-300">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );

export const AiAnalysis = ({ loading, text }) => {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    if (!text) return;
    const id = setInterval(() => {
      setShown((n) => {
        if (n >= text.length) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, 15);
    return () => clearInterval(id);
  }, [text]);

  if (loading) {
    return (
      <div className="mt-3 flex items-center gap-3 rounded-lg border border-violet-500/30 bg-slate-900/60 p-3">
        <div className="flex gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
        <span className="animate-pulse text-sm text-slate-300">
          AI is thinking...
        </span>
      </div>
    );
  }

  if (!text) return null;

  const typing = shown < text.length;

  return (
    <div className="mt-3 rounded-lg border border-violet-500/30 bg-slate-900/60 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-400">
        ✦ AI insight
      </p>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
        {renderBold(text.slice(0, shown))}
        {typing && (
          <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-violet-400 align-middle" />
        )}
      </p>
    </div>
  );
};
