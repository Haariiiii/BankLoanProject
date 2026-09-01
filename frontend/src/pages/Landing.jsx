import { useNavigate } from "react-router-dom";
import {
  Brain, Sparkles, ArrowRight, CheckCircle2, Target,
  ShieldCheck, TrendingUp, BarChart3, Users, Clock, HelpCircle
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="fade-in">
      {/* ── Hero Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, var(--navy) 0%, #1a365d 50%, #0f172a 100%)",
        borderRadius: "var(--radius)",
        padding: "48px 40px",
        color: "#fff",
        marginBottom: 32,
        position: "relative",
        overflow: "hidden",
        boxShadow: "var(--shadow-lg)"
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: "absolute",
          top: "-50%",
          right: "-10%",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(34,211,238,0.15) 0%, rgba(0,0,0,0) 70%)",
          borderRadius: "50%",
          pointerEvents: "none"
        }} />

        <div style={{ maxWidth: 780, position: "relative", zIndex: 2 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 99,
            background: "rgba(34,211,238,0.12)",
            border: "1px solid rgba(34,211,238,0.3)",
            color: "var(--teal-light)",
            fontSize: ".82rem",
            fontWeight: 600,
            marginBottom: 20
          }}>
            <Sparkles size={15} /> AI-Powered Marketing Intelligence
          </div>

          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: 16,
            letterSpacing: "-0.02em"
          }}>
            Predict Term Deposit Subscriptions with <span style={{ color: "var(--teal-light)" }}>Machine Learning</span>
          </h1>

          <p style={{
            fontSize: "1.05rem",
            color: "rgba(255,255,255,0.8)",
            lineHeight: 1.7,
            marginBottom: 28,
            fontWeight: 400
          }}>
            Harness a 90.0% accurate Random Forest model trained on 45,211 customer interactions. Instantly evaluate customer subscription likelihood to optimize phone outreach campaigns and increase deposit conversion.
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <button
              className="btn btn-lg"
              onClick={() => navigate("/predict")}
              style={{
                background: "var(--teal)",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                padding: "14px 28px",
                fontSize: "1rem",
                boxShadow: "0 4px 14px rgba(8,145,178,0.4)"
              }}
            >
              <Brain size={20} /> Launch Predictor <ArrowRight size={18} />
            </button>

            <button
              className="btn btn-lg"
              onClick={() => navigate("/about")}
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                fontWeight: 500,
                padding: "14px 24px",
                fontSize: "1rem"
              }}
            >
              <HelpCircle size={18} /> Documentation & Model Details
            </button>
          </div>
        </div>
      </div>

      {/* ── Key Highlights Row ── */}
      <div className="card-grid card-grid-4" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="icon-wrap icon-green">
            <TrendingUp size={22} />
          </div>
          <div className="label">Model Accuracy</div>
          <div className="value">90.0%</div>
          <div className="sub">Tested on 13,564 validation records</div>
        </div>

        <div className="stat-card">
          <div className="icon-wrap icon-teal">
            <BarChart3 size={22} />
          </div>
          <div className="label">ROC-AUC Score</div>
          <div className="value">0.923</div>
          <div className="sub">High discrimination power</div>
        </div>

        <div className="stat-card">
          <div className="icon-wrap icon-navy">
            <Users size={22} />
          </div>
          <div className="label">Dataset Size</div>
          <div className="value">45,211</div>
          <div className="sub">UCI Bank Marketing repository</div>
        </div>

        <div className="stat-card">
          <div className="icon-wrap icon-green">
            <ShieldCheck size={22} />
          </div>
          <div className="label">Class Balance</div>
          <div className="value">SMOTE 50/50</div>
          <div className="sub">Overcoming 88:12 raw imbalance</div>
        </div>
      </div>

      {/* ── Features & Capabilities ── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)" }}>
            Platform Capabilities
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: ".9rem" }}>
            Designed for marketing managers, telecallers, and financial analysts
          </p>
        </div>

        <div className="card-grid card-grid-3">
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="icon-wrap icon-teal" style={{ width: 40, height: 40 }}>
              <Target size={20} />
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--navy)" }}>
              Instant Lead Scoring
            </h3>
            <p style={{ fontSize: ".875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              Input 16 client & campaign parameters to receive immediate subscription predictions along with probability confidence percentages.
            </p>
          </div>

          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="icon-wrap icon-navy" style={{ width: 40, height: 40 }}>
              <Brain size={20} />
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--navy)" }}>
              Random Forest Engine
            </h3>
            <p style={{ fontSize: ".875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              Powered by 200 decision trees trained with hyperparameter tuning, delivering robust predictions without overfitting.
            </p>
          </div>

          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="icon-wrap icon-green" style={{ width: 40, height: 40 }}>
              <Clock size={20} />
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--navy)" }}>
              Prediction Audit History
            </h3>
            <p style={{ fontSize: ".875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              All prediction sessions are saved automatically to track team queries, analyze trends, and export campaign history.
            </p>
          </div>
        </div>
      </div>

      {/* ── How It Works Steps ── */}
      <div className="card" style={{ padding: 32, marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--navy)", marginBottom: 24, textAlign: "center" }}>
          How to Make a Prediction
        </h2>

        <div className="card-grid card-grid-3">
          <div style={{ textAlign: "center", padding: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", background: "var(--navy)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, margin: "0 auto 12px"
            }}>1</div>
            <h4 style={{ fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Enter Client Info</h4>
            <p style={{ fontSize: ".85rem", color: "var(--text-muted)" }}>Fill in age, job, marital status, education, balance, and loans.</p>
          </div>

          <div style={{ textAlign: "center", padding: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", background: "var(--teal)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, margin: "0 auto 12px"
            }}>2</div>
            <h4 style={{ fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Campaign Metrics</h4>
            <p style={{ fontSize: ".85rem", color: "var(--text-muted)" }}>Specify call duration, contact channel, day/month, and prior outcomes.</p>
          </div>

          <div style={{ textAlign: "center", padding: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", background: "var(--success)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, margin: "0 auto 12px"
            }}>3</div>
            <h4 style={{ fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Get Instant Result</h4>
            <p style={{ fontSize: ".85rem", color: "var(--text-muted)" }}>Receive subscription probability score (YES / NO) with confidence bar.</p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate("/predict")}>
            <Brain size={18} /> Open Prediction Tool Now
          </button>
        </div>
      </div>
    </div>
  );
}
