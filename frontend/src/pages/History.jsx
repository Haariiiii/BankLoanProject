import { useEffect, useState, useCallback } from "react";
import { getHistory, clearHistory } from "../services/api";
import { Trash2, RefreshCw, Search } from "lucide-react";

export default function History() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");

  const load = useCallback(() => {
    setLoading(true); setError(null);
    getHistory()
      .then(r => setRows(r.data.history))
      .catch(() => setError("Could not load history. Is Flask running?"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleClear = async () => {
    if (!confirm("Clear all prediction history?")) return;
    await clearHistory();
    setRows([]);
  };

  const filtered = rows.filter(r => {
    const matchFilter = filter === "all" || r.prediction === filter;
    const matchSearch = !search ||
      r.timestamp.includes(search) ||
      r.prediction.includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const fmtDate = (ts) => {
    try { return new Date(ts).toLocaleString(); }
    catch { return ts; }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Prediction History</h1>
        <p>All predictions made through this application</p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            className="form-control"
            style={{ paddingLeft: 34 }}
            placeholder="Search predictions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-control"
          style={{ width: "auto" }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Predictions</option>
          <option value="yes">Yes only</option>
          <option value="no">No only</option>
        </select>
        <button className="btn btn-secondary" onClick={load}>
          <RefreshCw size={15} /> Refresh
        </button>
        <button className="btn btn-danger" onClick={handleClear} disabled={rows.length === 0}>
          <Trash2 size={15} /> Clear History
        </button>
      </div>

      {/* Summary */}
      {!loading && rows.length > 0 && (
        <div className="card-grid card-grid-3" style={{ marginBottom: 20 }}>
          {[
            { label: "Total Predictions", value: rows.length },
            { label: "Subscribed (Yes)",  value: rows.filter(r => r.prediction === "yes").length },
            { label: "Not Subscribed (No)", value: rows.filter(r => r.prediction === "no").length },
          ].map(({ label, value }) => (
            <div key={label} className="stat-card">
              <div className="label">{label}</div>
              <div className="value">{value}</div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="error-banner">⚠ {error}</div>}

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /><p>Loading history…</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <h3>No predictions yet</h3>
          <p>Make a prediction on the Predict page to see it here.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Timestamp</th>
                  <th>Prediction</th>
                  <th>P(Yes)</th>
                  <th>P(No)</th>
                  <th>Confidence</th>
                  <th>Model</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const conf = Math.max(r.prob_yes, r.prob_no);
                  return (
                    <tr key={r.id}>
                      <td style={{ color: "var(--text-muted)", fontSize: ".8rem" }}>{r.id}</td>
                      <td style={{ fontSize: ".82rem" }}>{fmtDate(r.timestamp)}</td>
                      <td>
                        <span className={`badge ${r.prediction === "yes" ? "badge-yes" : "badge-no"}`}>
                          {r.prediction.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: "#16a34a" }}>{(r.prob_yes * 100).toFixed(1)}%</td>
                      <td style={{ fontWeight: 600, color: "#dc2626" }}>{(r.prob_no  * 100).toFixed(1)}%</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 60, height: 6, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ width: `${(conf * 100).toFixed(0)}%`, height: "100%", background: "var(--teal)", borderRadius: 99 }} />
                          </div>
                          <span style={{ fontSize: ".8rem", fontWeight: 600 }}>{(conf * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>{r.model_name}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, fontSize: ".8rem", color: "var(--text-muted)" }}>
            Showing {filtered.length} of {rows.length} predictions
          </div>
        </div>
      )}
    </div>
  );
}
