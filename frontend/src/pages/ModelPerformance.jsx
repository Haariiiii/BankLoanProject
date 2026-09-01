import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from "recharts";
import { getMetrics, getFeatureImportance } from "../services/api";

export default function ModelPerformance() {
  const [metrics, setMetrics] = useState(null);
  const [fi, setFi]           = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    Promise.all([getMetrics(), getFeatureImportance(20)])
      .then(([mRes, fiRes]) => {
        setMetrics(mRes.data);
        setFi(fiRes.data.feature_importance);
      })
      .catch(() => setError("Could not load model metrics. Is Flask running?"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /><p>Loading metrics…</p></div>;
  if (error)   return <div className="error-banner">⚠ {error}</div>;
  if (!metrics) return null;

  const { confusion_matrix: cm, model_comparison, roc_curve, pr_curve } = metrics;

  const fiChartData = fi.slice(0, 15).map(({ feature, importance }) => ({
    feature: feature.length > 20 ? feature.substring(0, 18) + "…" : feature,
    fullName: feature,
    importance: parseFloat((importance * 100).toFixed(2)),
  })).reverse();

  const rocData = roc_curve.fpr.map((fpr, i) => ({
    fpr: parseFloat(fpr.toFixed(3)),
    tpr: parseFloat(roc_curve.tpr[i]?.toFixed(3) ?? 0),
  }));

  const prData = pr_curve.recall.map((rec, i) => ({
    recall:    parseFloat(rec.toFixed(3)),
    precision: parseFloat(pr_curve.precision[i]?.toFixed(3) ?? 0),
  }));

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Model Performance</h1>
        <p>Detailed evaluation metrics for all trained models</p>
      </div>

      {/* Key Metrics */}
      <div className="card-grid card-grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "Accuracy",    value: `${(metrics.accuracy * 100).toFixed(2)}%` },
          { label: "ROC-AUC",     value: metrics.roc_auc },
          { label: "Yes F1-Score",value: `${(metrics.f1_yes * 100).toFixed(1)}%` },
          { label: "Yes Recall",  value: `${(metrics.recall_yes * 100).toFixed(1)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card">
            <div className="label">{label}</div>
            <div className="value">{value}</div>
            <div className="sub">Random Forest</div>
          </div>
        ))}
      </div>

      {/* Model Comparison */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">Model Comparison</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>Accuracy</th>
                <th>Yes Precision</th>
                <th>Yes Recall</th>
                <th>Yes F1</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {model_comparison.map(m => (
                <tr key={m.model} style={m.best ? { background: "#f0fdf4" } : {}}>
                  <td style={{ fontWeight: m.best ? 700 : 400 }}>{m.model}</td>
                  <td>{m.accuracy.toFixed(2)}%</td>
                  <td>{m.yes_precision}%</td>
                  <td>{m.yes_recall}%</td>
                  <td>{m.yes_f1}%</td>
                  <td>{m.best ? <span className="badge badge-best">⭐ Best</span> : <span className="badge badge-navy">Tested</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-grid card-grid-2" style={{ marginBottom: 24 }}>
        {/* Confusion Matrix */}
        <div className="card">
          <div className="card-title">Confusion Matrix (Test Set)</div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: 6, alignItems: "center", maxWidth: 360 }}>
              <div></div>
              <div style={{ textAlign: "center", fontSize: ".75rem", fontWeight: 700, color: "var(--text-muted)", padding: "4px 0" }}>Pred NO</div>
              <div style={{ textAlign: "center", fontSize: ".75rem", fontWeight: 700, color: "var(--text-muted)", padding: "4px 0" }}>Pred YES</div>
              <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--text-muted)", writingMode: "vertical-rl", transform: "rotate(180deg)", paddingRight: 8 }}>Actual NO</div>
              <div className="cm-cell cm-tn" style={{ borderRadius: 8, padding: "20px 14px", textAlign: "center" }}>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#166534" }}>{cm[0][0].toLocaleString()}</div>
                <div style={{ fontSize: ".72rem", marginTop: 4, color: "#166534" }}>True Negative</div>
              </div>
              <div className="cm-cell cm-fp" style={{ borderRadius: 8, padding: "20px 14px", textAlign: "center" }}>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#991b1b" }}>{cm[0][1].toLocaleString()}</div>
                <div style={{ fontSize: ".72rem", marginTop: 4, color: "#991b1b" }}>False Positive</div>
              </div>
              <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--text-muted)", writingMode: "vertical-rl", transform: "rotate(180deg)", paddingRight: 8 }}>Actual YES</div>
              <div className="cm-cell cm-fn" style={{ borderRadius: 8, padding: "20px 14px", textAlign: "center" }}>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#991b1b" }}>{cm[1][0].toLocaleString()}</div>
                <div style={{ fontSize: ".72rem", marginTop: 4, color: "#991b1b" }}>False Negative</div>
              </div>
              <div className="cm-cell cm-tp" style={{ borderRadius: 8, padding: "20px 14px", textAlign: "center" }}>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#166534" }}>{cm[1][1].toLocaleString()}</div>
                <div style={{ fontSize: ".72rem", marginTop: 4, color: "#166534" }}>True Positive</div>
              </div>
            </div>
          </div>
          <div className="section-divider" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Precision (No)",  value: `${(metrics.precision_no * 100).toFixed(1)}%` },
              { label: "Recall (No)",     value: `${(metrics.recall_no * 100).toFixed(1)}%` },
              { label: "Precision (Yes)", value: `${(metrics.precision_yes * 100).toFixed(1)}%` },
              { label: "Recall (Yes)",    value: `${(metrics.recall_yes * 100).toFixed(1)}%` },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: ".72rem", color: "var(--text-muted)" }}>{label}</div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--navy)" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ROC Curve */}
        <div className="card">
          <div className="card-title">ROC Curve (AUC = {metrics.roc_auc})</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={rocData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="fpr" label={{ value: "FPR", position: "insideBottom", offset: -4 }} />
              <YAxis label={{ value: "TPR", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(v) => v.toFixed(3)} />
              <Line type="monotone" dataKey="tpr" stroke="#0891b2" dot={false} strokeWidth={2} name="ROC" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PR Curve */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">Precision-Recall Curve (AP = {metrics.avg_precision})</div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={prData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="recall" label={{ value: "Recall", position: "insideBottom", offset: -4 }} />
            <YAxis label={{ value: "Precision", angle: -90, position: "insideLeft" }} />
            <Tooltip formatter={(v) => v.toFixed(3)} />
            <Line type="monotone" dataKey="precision" stroke="#16a34a" dot={false} strokeWidth={2} name="Precision" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Feature Importance */}
      <div className="card">
        <div className="card-title">Top 15 Feature Importances</div>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={fiChartData} layout="vertical" margin={{ left: 140, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="feature" width={130} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(v) => `${v}%`}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ""}
            />
            <Bar dataKey="importance" fill="#0891b2" radius={[0, 4, 4, 0]} name="Importance" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
