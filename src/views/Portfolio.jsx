import { useEffect, useRef, useState } from "react";
import { getToken } from "../helper/supabase";
import { Header } from "../components/Header";

const API_URL = import.meta.env.VITE_API_URL;

export const Portfolio = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    try {
      const res = await fetch(`${API_URL}/watchlist`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to load portfolio");
      setItems(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [prices, setPrices] = useState({});
  const requested = useRef(new Set());

  useEffect(() => {
    items.forEach(async (item) => {
      if (item.quantity == null || requested.current.has(item.id)) return;
      requested.current.add(item.id);
      try {
        const res = await fetch(
          `${API_URL}/market/price/${item.symbol}?type=${item.asset_type}`,
          { headers: { Authorization: `Bearer ${await getToken()}` } },
        );
        const data = await res.json();
        setPrices((prev) => ({ ...prev, [item.id]: data.price }));
      } catch {
        // leave the price blank if the request fails
      }
    });
  }, [items]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (id, quantity, buyPrice) => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/watchlist/holding`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({
          watchlist_id: id,
          quantity: quantity === "" ? null : Number(quantity),
          buy_price: buyPrice === "" ? null : Number(buyPrice),
        }),
      });
      if (!res.ok) throw new Error("Failed to save holding");
      await loadItems();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const holdings = items.filter(
    (i) => i.quantity != null && i.buy_price != null && prices[i.id] != null,
  );
  const totalCost = holdings.reduce((s, i) => s + i.quantity * i.buy_price, 0);
  const totalValue = holdings.reduce(
    (s, i) => s + i.quantity * prices[i.id],
    0,
  );
  const totalPL = totalValue - totalCost;
  const totalPct = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

  return (
    <div className="min-h-screen p-4">
      <Header />
      <div className="mx-auto max-w-5xl">
        {error && <p className="mb-2 text-sm text-red-400">{error}</p>}

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-800 p-3">
            <p className="text-xs text-slate-400">Total value</p>
            <p className="text-lg font-semibold">${totalValue.toFixed(2)}</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-3">
            <p className="text-xs text-slate-400">Total cost</p>
            <p className="text-lg font-semibold">${totalCost.toFixed(2)}</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-3">
            <p className="text-xs text-slate-400">Profit / Loss</p>
            <p
              className={`text-lg font-semibold ${
                totalPL > 0
                  ? "text-green-400"
                  : totalPL < 0
                    ? "text-red-400"
                    : ""
              }`}
            >
              {totalPL >= 0 ? "+" : ""}${totalPL.toFixed(2)} (
              {totalPct.toFixed(1)}%)
            </p>
          </div>
        </div>

        {loading && (
          <p className="text-sm text-slate-400">Loading portfolio...</p>
        )}
        {!loading && items.length === 0 && !error && (
          <p className="text-sm text-slate-400">
            Your watchlist is empty. Add assets on the Dashboard first.
          </p>
        )}

        <div className="overflow-x-auto rounded-lg bg-slate-800/50">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="p-2">Symbol</th>
                <th className="p-2">Type</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Buy price</th>
                <th className="p-2">Price</th>
                <th className="p-2">Value</th>
                <th className="p-2">P/L</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <HoldingRow
                  key={item.id}
                  item={item}
                  price={prices[item.id]}
                  onSave={handleSave}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const HoldingRow = ({ item, price, onSave }) => {
  const [quantity, setQuantity] = useState(item.quantity ?? "");
  const [buyPrice, setBuyPrice] = useState(item.buy_price ?? "");
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error

  const dirty =
    String(quantity) !== String(item.quantity ?? "") ||
    String(buyPrice) !== String(item.buy_price ?? "");

  const handleClick = async () => {
    setStatus("saving");
    const ok = await onSave(item.id, quantity, buyPrice);
    setStatus(ok ? "saved" : "error");
    if (ok) setTimeout(() => setStatus("idle"), 2000);
  };

  const hasHolding = item.quantity != null && item.buy_price != null;
  const value = hasHolding && price != null ? item.quantity * price : null;
  const pl =
    hasHolding && price != null
      ? (price - item.buy_price) * item.quantity
      : null;

  return (
    <tr className="border-t border-slate-700">
      <td className="p-2 font-semibold">{item.symbol}</td>
      <td className="p-2 text-slate-400">{item.asset_type}</td>
      <td className="p-2">
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-24 rounded bg-slate-700 px-2 py-1"
        />
      </td>
      <td className="p-2">
        <input
          type="number"
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
          className="w-24 rounded bg-slate-700 px-2 py-1"
        />
      </td>
      <td className="p-2">{price != null ? `$${price}` : "—"}</td>
      <td className="p-2">{value != null ? `$${value.toFixed(2)}` : "—"}</td>
      <td
        className={`p-2 ${pl > 0 ? "text-green-400" : pl < 0 ? "text-red-400" : ""}`}
      >
        {pl != null ? `${pl >= 0 ? "+" : ""}$${pl.toFixed(2)}` : "—"}
      </td>
      <td className="p-2">
        <button
          onClick={handleClick}
          disabled={(!dirty && status !== "saved") || status === "saving"}
          className={`w-24 rounded px-3 py-1 transition-colors disabled:opacity-50 ${
            status === "saved"
              ? "bg-green-600"
              : status === "error"
                ? "bg-red-600"
                : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {status === "saving" && "Saving..."}
          {status === "saved" && "✓ Saved"}
          {status === "error" && "Retry"}
          {status === "idle" && "Save"}
        </button>
      </td>
    </tr>
  );
};
