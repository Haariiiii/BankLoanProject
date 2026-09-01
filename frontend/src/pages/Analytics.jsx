import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import { getAnalytics } from "../services/api";

const COLORS = ["#0891b2", "#16a34a", "#d97706", "#dc2626"];

export default function Analytics() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    getAnalytics()
      .then(r => setData(r.data))
      .catch(() => setError("Could not load analytics. Is Flask running?"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /><p>Loading analytics…</p></div>;
  if (error)   return <div className="error-banner">⚠ {error}</div>;
  if (!data)   return null;

  const { dataset, smote } = data;
  const dist = dataset.target_distribution;

  const pieData = [
    { name: "No (did not subscribe)", value: dist.no },
    { name: "Yes (subscribed)",       value: dist.yes },
  ];
  const piePct  = [
    { name: "No",  value: Math.round((dist.no  / (dist.no + dist.yes)) * 100) },
    { name: "Yes", value: Math.round((dist.yes / (dist.no + dist.yes)) * 100) },
  ];

  const smoteData = [
    { group: "Before SMOTE", No: smote.before.no, Yes: smote.before.yes },
    { group: "After SMOTE",  No: smote.after.no,  Yes: smote.after.yes  },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Dataset Analytics</h1>
        <p>Explore the bank marketing dataset statistics and class distribution</p>
      </div>

      {/* Stats */}
      <div className="card-grid card-grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "Total Records",  value: dataset.total_rows.toLocaleString() },
          { label: "Features",       value: dataset.total_features },
          { label: "Subscribed Yes", value: dist.yes.toLocaleString() },
          { label: "Subscribed No",  value: dist.no.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card">
            <div className="label">{label}</div>
            <div className="value">{value}</div>
          </div>
        ))}
      </div>

      <div className="card-grid card-grid-2" style={{ marginBottom: 24 }}>
        {/* Pie Chart */}
        <div className="card">
          <div className="card-title">Target Class Distribution</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={95} label={({ name, percent }) => `${(percent * 100).toFixed(1)}%`}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#0891b2" : "#16a34a"} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => v.toLocaleString()} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
            <span className="badge badge-navy">No: {piePct[0].value}%</span>
            <span className="badge badge-yes">Yes: {piePct[1].value}%</span>
          </div>
        </div>

        {/* Class Imbalance Note */}
        <div className="card">
          <div className="card-title">Class Imbalance</div>
          <div style={{ fontSize: ".875rem", lineHeight: 1.9, color: "var(--text-muted)" }}>
            <p style={{ marginBottom: 12 }}>
              The dataset is <strong style={{ color: "var(--navy)" }}>highly imbalanced</strong> —
              only <strong style={{ color: "var(--success)" }}>{dist.yes.toLocaleString()} ({piePct[1].value}%)</strong> customers
              subscribed, vs <strong style={{ color: "var(--danger)" }}>{dist.no.toLocaleString()} ({piePct[0].value}%)</strong> who did not.
            </p>
            <p style={{ marginBottom: 12 }}>
              Training directly on imbalanced data would cause the model to be biased toward
              predicting "No" — missing genuine positive cases.
            </p>
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "14px 16px", marginTop: 12 }}>
              <strong style={{ color: "#0369a1" }}>Solution: SMOTE</strong>
              <p style={{ marginTop: 6 }}>
                Synthetic Minority Over-sampling Technique (SMOTE) was applied
                <em> only to training data</em> to create synthetic "Yes" samples,
                balancing the training set to 50/50. Test data was never touched.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Before/After SMOTE */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">Before vs After SMOTE (Training Data)</div>
        <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: ".82rem", color: "#92400e" }}>
          ⚠ <strong>Important:</strong> SMOTE is applied <em>only to training data</em>.
          The test set remains in its original imbalanced form to provide honest evaluation metrics.
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={smoteData} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="group" />
            <YAxis tickFormatter={(v) => (v / 1000).toFixed(0) + "k"} />
            <Tooltip formatter={(v) => v.toLocaleString()} />
            <Legend />
            <Bar dataKey="No"  fill="#0891b2" radius={[4,4,0,0]} />
            <Bar dataKey="Yes" fill="#16a34a" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
          {[
            { title: "Before SMOTE", no: smote.before.no, yes: smote.before.yes, ratio: `${Math.round(smote.before.no/smote.before.yes)}:1` },
            { title: "After SMOTE",  no: smote.after.no,  yes: smote.after.yes,  ratio: "1:1" },
          ].map(({ title, no, yes, ratio }) => (
            <div key={title} style={{ background: "#f8fafc", borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: ".82rem", display: "flex", flexDirection: "column", gap: 4 }}>
                <span>No: <strong>{no.toLocaleString()}</strong></span>
                <span>Yes: <strong>{yes.toLocaleString()}</strong></span>
                <span className={`badge ${title.includes("After") ? "badge-yes" : "badge-no"}`} style={{ width: "fit-content", marginTop: 4 }}>
                  Ratio: {ratio}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Types */}
      <div className="card-grid card-grid-2">
        <div className="card">
          <div className="card-title">Numerical Features</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {data.feature_types.numerical.map(f => (
              <span key={f} className="badge badge-navy">{f}</span>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Categorical Features</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {data.feature_types.categorical.map(f => (
              <span key={f} className="badge badge-navy">{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
