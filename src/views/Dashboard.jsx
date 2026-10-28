import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Header } from "../components/Header";
import { AiAnalysis } from "../components/AiAnalysis";
import MarqueeModule from "react-fast-marquee";

const Marquee = MarqueeModule.default ?? MarqueeModule;

const API_URL = import.meta.env.VITE_API_URL;

export const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [note, setNote] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [chartError, setChartError] = useState("");
  const [noteStatus, setNoteStatus] = useState("idle"); // idle | saving | saved | error
  const [savedNote, setSavedNote] = useState("");

  const getToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session.access_token;
  };

  const loadWatchlist = async () => {
    try {
      const res = await fetch(`${API_URL}/watchlist`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to load watchlist");
      setItems(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWatchlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHistory([]);
      return;
    }
    const loadHistory = async () => {
      setLoadingChart(true);
      setChartError("");
      setHistory([]);
      try {
        const res = await fetch(
          `${API_URL}/market/stocks/history/${selected.symbol}?type=${selected.asset_type}`,
          { headers: { Authorization: `Bearer ${await getToken()}` } },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(data.error || "Failed to load price history");
        setHistory(data.results ?? []);
      } catch (err) {
        setChartError(err.message);
      } finally {
        setLoadingChart(false);
      }
    };
    loadHistory();
  }, [selected]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNote(selected?.notes_content ?? "");
    setSavedNote(selected?.notes_content ?? "");
    setNoteStatus("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const [symbol, setSymbol] = useState("");
  const [assetType, setAssetType] = useState("stock");

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/watchlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({ symbol, asset_type: assetType }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add asset");
      }
      setSymbol("");
      loadWatchlist();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/watchlist/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to remove asset");
      if (selected?.id === id) setSelected(null);
      loadWatchlist();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveNote = async () => {
    setError("");
    setNoteStatus("saving");
    try {
      const res = await fetch(`${API_URL}/watchlist/notes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({
          watchlist_id: selected.id,
          notes_content: note,
        }),
      });
      if (!res.ok) throw new Error("Failed to save note");
      setSavedNote(note);
      setNoteStatus("saved");
      setTimeout(() => setNoteStatus("idle"), 2000);
      loadWatchlist();
    } catch (err) {
      setError(err.message);
      setNoteStatus("error");
    }
  };

  const handleAnalyze = async () => {
    setError("");
    setAnalysis("");
    setAnalyzing(true);
    try {
      const res = await fetch(`${API_URL}/ai/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({ portfolioContext: items }),
      });
      if (!res.ok) throw new Error("Failed to generate analysis");
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <Header />

      {items.length > 0 && (
        <Marquee
          className="mb-4 rounded border border-slate-700 bg-slate-800 py-2"
          speed={40}
          pauseOnHover
          gradient={false}
        >
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="mx-6 text-sm font-semibold text-slate-200 hover:text-emerald-400"
            >
              {item.symbol}
              <span className="ml-1 text-xs text-slate-400">
                {item.asset_type}
              </span>
            </button>
          ))}
        </Marquee>
      )}

      <main className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-lg bg-slate-800 p-4">
          <h2 className="mb-2 font-semibold">Watchlist</h2>
          <form onSubmit={handleAdd} className="mb-3 flex gap-2">
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Symbol (e.g. TSLA)"
              required
              className="w-full rounded bg-slate-700 px-2 py-1"
            />
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="rounded bg-slate-700 px-2 py-1"
            >
              <option value="stock">stock</option>
              <option value="crypto">crypto</option>
            </select>
            <button className="rounded bg-blue-600 px-3 py-1 hover:bg-blue-500">
              Add
            </button>
          </form>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {loadingList && (
            <p className="text-sm text-slate-400">Loading watchlist...</p>
          )}
          {!loadingList && items.length === 0 && !error && (
            <p className="text-sm text-slate-400">
              No assets yet. Add one above.
            </p>
          )}
          <ul className="space-y-1">
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => setSelected(item)}
                className={`flex cursor-pointer items-center justify-between rounded px-3 py-2 ${
                  selected?.id === item.id ? "bg-blue-700" : "bg-slate-700"
                }`}
              >
                <span>{item.symbol}</span>
                <span className="flex items-center gap-3">
                  <span className="text-slate-400">{item.asset_type}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg bg-slate-800 p-4">
          <h2 className="mb-2 font-semibold">Market Chart</h2>
          {selected ? (
            <div>
              <p className="font-semibold">{selected.symbol}</p>
              <p
                className={`text-sm ${chartError ? "text-red-400" : "text-slate-400"}`}
              >
                {loadingChart
                  ? "Loading chart..."
                  : chartError
                    ? chartError
                    : `${history.length} days loaded`}
              </p>
              <div
                className="mt-2 h-64"
                hidden={loadingChart || history.length === 0}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={history.map((p) => ({
                      date: new Date(p.t).toLocaleDateString(),
                      close: p.c,
                    }))}
                  >
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      domain={["auto", "auto"]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b",
                        border: "none",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke="#3b82f6"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Select an asset from your watchlist.
            </p>
          )}
        </section>

        <section className="rounded-lg bg-slate-800 p-4">
          <h2 className="mb-2 font-semibold">Strategy Notes</h2>
          {selected ? (
            <div>
              <p className="mb-1 text-sm text-slate-400">{selected.symbol}</p>
              <textarea
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  if (noteStatus !== "saving") setNoteStatus("idle");
                }}
                rows={5}
                placeholder="e.g. Buy the dip"
                className="w-full rounded bg-slate-700 p-2 text-sm"
              />
              <div className="mt-2 flex items-center gap-3">
                <div className="mt-2">
                  <button
                    onClick={handleSaveNote}
                    disabled={
                      (note === savedNote && noteStatus !== "saved") ||
                      noteStatus === "saving"
                    }
                    className={`w-28 rounded px-3 py-1 transition-colors disabled:opacity-50 ${
                      noteStatus === "saved"
                        ? "bg-green-600"
                        : noteStatus === "error"
                          ? "bg-red-600"
                          : "bg-blue-600 hover:bg-blue-500"
                    }`}
                  >
                    {noteStatus === "saving" && "Saving..."}
                    {noteStatus === "saved" && "✓ Saved"}
                    {noteStatus === "error" && "Retry"}
                    {noteStatus === "idle" && "Save note"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Select an asset to write a note.
            </p>
          )}
          <div className="mt-6 border-t border-slate-700 pt-4">
            <h2 className="mb-2 font-semibold">AI Risk Analysis</h2>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || items.length === 0}
              className="rounded bg-purple-600 px-3 py-1 hover:bg-purple-500 disabled:opacity-50"
            >
              {analyzing ? "Analyzing..." : "Analyze portfolio"}
            </button>
            <AiAnalysis loading={analyzing} text={analysis} />
          </div>
        </section>
      </main>
    </div>
  );
};
