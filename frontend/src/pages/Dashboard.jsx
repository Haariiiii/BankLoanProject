import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Database, Brain, Target, TrendingUp, CheckCircle, Users
} from "lucide-react";
import { getModelInfo } from "../services/api";

export default function Dashboard() {
  const [info, setInfo]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const navigate            = useNavigate();

  useEffect(() => {
    getModelInfo()
      .then(r => setInfo(r.data))
      .catch(() => setError("Could not connect to backend. Is Flask running?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Bank Marketing Prediction</h1>
        <p>Predict customer subscription to term deposits using machine learning</p>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠</span> {error}
        </div>
      )}

      {/* Business Context */}
      <div className="card" style={{ marginBottom: 24, borderLeft: "4px solid var(--teal)" }}>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.8, fontSize: ".9rem" }}>
          <strong style={{ color: "var(--navy)" }}>Business Problem:</strong> A Portuguese bank
          conducted direct marketing campaigns (phone calls) to sell term deposits. This platform
          predicts whether a client will subscribe <strong>('yes')</strong> based on 16 customer
          and campaign attributes — enabling the bank to prioritize high-value leads and reduce
          wasted outreach costs.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="card-grid card-grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="icon-wrap icon-teal"><Database size={20} /></div>
          <div className="label">Dataset Size</div>
          <div className="value">45,211</div>
          <div className="sub">customer records</div>
        </div>
        <div className="stat-card">
          <div className="icon-wrap icon-navy"><Brain size={20} /></div>
          <div className="label">Features</div>
          <div className="value">16</div>
          <div className="sub">input attributes</div>
        </div>
        <div className="stat-card">
          <div className="icon-wrap icon-green"><CheckCircle size={20} /></div>
          <div className="label">Best Accuracy</div>
          <div className="value">{info ? `${(info.accuracy * 100).toFixed(1)}%` : "—"}</div>
          <div className="sub">on test set</div>
        </div>
        <div className="stat-card">
          <div className="icon-wrap icon-teal"><TrendingUp size={20} /></div>
          <div className="label">ROC-AUC</div>
          <div className="value">{info ? info.roc_auc : "—"}</div>
          <div className="sub">discriminatory power</div>
        </div>
      </div>

      {/* Model + Metrics */}
      <div className="card-grid card-grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">Best Model</div>
          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : info ? (
            <div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>
                {info.model_name}
              </div>
              <table style={{ width: "100%", fontSize: ".875rem" }}>
                <tbody>
                  {[
                    ["Accuracy",          `${(info.accuracy * 100).toFixed(2)}%`],
                    ["ROC-AUC",           info.roc_auc],
                    ["Yes Precision",     `${(info.precision_yes * 100).toFixed(1)}%`],
                    ["Yes Recall",        `${(info.recall_yes * 100).toFixed(1)}%`],
                    ["Yes F1-Score",      `${(info.f1_yes * 100).toFixed(1)}%`],
                    ["Estimators",        info.n_estimators],
                    ["Feature Count",     info.feature_count],
                  ].map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "8px 0", color: "var(--text-muted)", fontWeight: 500 }}>{k}</td>
                      <td style={{ padding: "8px 0", fontWeight: 600, textAlign: "right" }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ color: "var(--text-muted)" }}>Model info unavailable</div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Dataset Overview</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Source",       value: "UCI ML Repository — Bank Marketing" },
              { label: "Records",      value: "45,211" },
              { label: "Target",       value: "y (yes/no) — term deposit subscription" },
              { label: "Class Balance",value: "No: 88.3% · Yes: 11.7% (imbalanced)" },
              { label: "SMOTE Applied",value: "Training data only (balanced to 50/50)" },
              { label: "Test Size",    value: "30% (13,564 records)" },
              { label: "Models Tested",value: "7 algorithms compared" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: ".875rem", alignItems: "flex-start" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 500, flexShrink: 0 }}>{label}</span>
                <span style={{ fontWeight: 600, textAlign: "right" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="card" style={{ textAlign: "center", padding: "40px 24px" }}>
        <Users size={40} style={{ color: "var(--teal)", marginBottom: 16 }} />
        <h2 style={{ color: "var(--navy)", marginBottom: 8 }}>Ready to Predict?</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
          Enter customer information to get an instant prediction with probability scores.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate("/predict")}>
          <Brain size={18} /> Make a Prediction
        </button>
      </div>
    </div>
  );
}
