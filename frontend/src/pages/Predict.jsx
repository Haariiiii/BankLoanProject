import { useState } from "react";
import { predict as apiPredict } from "../services/api";
import ProbabilityBar from "../components/ProbabilityBar";
import { Brain, RefreshCw, User } from "lucide-react";

// ── Field definitions ──────────────────────────────────────────────────────────
const JOBS = [
  "admin.","blue-collar","entrepreneur","housemaid","management",
  "retired","self-employed","services","student","technician","unemployed","unknown"
];
const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const POUTCOMES = ["success","failure","other","unknown"];

const SAMPLE_CUSTOMER = {
  age: 41, job: "management", marital: "married", education: "tertiary",
  default: "no", balance: 1357, housing: "yes", loan: "no",
  contact: "cellular", day: 5, month: "may", duration: 261,
  campaign: 1, pdays: -1, previous: 0, poutcome: "unknown",
};

const EMPTY = {
  age: "", job: "", marital: "", education: "", default: "",
  balance: "", housing: "", loan: "", contact: "", day: "",
  month: "", duration: "", campaign: "", pdays: "", previous: "", poutcome: "",
};

function Field({ name, label, hint, errors, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label} <span className="required">*</span></label>
      {children}
      {hint && <span className="form-hint">{hint}</span>}
      {errors[name] && <span className="form-hint" style={{ color: "var(--danger)" }}>{errors[name]}</span>}
    </div>
  );
}

function Inp({ name, form, onChange, errors, ...props }) {
  return (
    <input
      className={`form-control${errors[name] ? " error" : ""}`}
      value={form[name]}
      onChange={onChange(name)}
      {...props}
    />
  );
}

function Sel({ name, form, onChange, errors, children }) {
  return (
    <select
      className={`form-control${errors[name] ? " error" : ""}`}
      value={form[name]}
      onChange={onChange(name)}
    >
      <option value="">Select…</option>
      {children}
    </select>
  );
}

export default function Predict() {
  const [form, setForm]         = useState(EMPTY);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState(null);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const loadSample = () => {
    setForm({ ...SAMPLE_CUSTOMER });
    setResult(null); setErrors({}); setApiError(null);
  };

  const reset = () => {
    setForm(EMPTY); setResult(null); setErrors({}); setApiError(null);
  };

  const validate = () => {
    const errs = {};
    const numFields = ["age", "balance", "day", "duration", "campaign", "pdays", "previous"];
    const required  = Object.keys(EMPTY);

    required.forEach(k => {
      const v = form[k];
      if (v === "" || v === null || v === undefined) { errs[k] = "Required"; return; }
      if (numFields.includes(k) && isNaN(Number(v))) errs[k] = "Must be a number";
    });

    if (!errs.age && (Number(form.age) < 18 || Number(form.age) > 100))
      errs.age = "Must be 18–100";
    if (!errs.day && (Number(form.day) < 1 || Number(form.day) > 31))
      errs.day = "Must be 1–31";
    if (!errs.duration && Number(form.duration) < 0)
      errs.duration = "Must be ≥ 0";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null); setResult(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = { ...form };
      ["age","balance","day","duration","campaign","pdays","previous"].forEach(
        k => { payload[k] = Number(payload[k]); }
      );
      const { data } = await apiPredict(payload);
      setResult(data);
    } catch (err) {
      const detail = err.response?.data?.errors || err.response?.data?.error || err.message;
      setApiError(Array.isArray(detail) ? detail.join("; ") : String(detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Customer Prediction</h1>
        <p>Enter customer details to predict term deposit subscription likelihood</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <button type="button" className="btn btn-secondary" onClick={loadSample}>
            <User size={16} /> Load Sample Customer
          </button>
          <button type="button" className="btn btn-secondary" onClick={reset}>
            <RefreshCw size={16} /> Reset
          </button>
        </div>

        {apiError && (
          <div className="error-banner">
            <span>⚠</span> {apiError}
          </div>
        )}

        {/* ── Section: Client Info ── */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Client Information</div>
          <div className="form-grid form-grid-3">
            <Field name="age" label="Age" hint="18–100" errors={errors}>
              <Inp name="age" type="number" placeholder="e.g. 41" min={18} max={100} form={form} onChange={set} errors={errors} />
            </Field>
            <Field name="job" label="Job" errors={errors}>
              <Sel name="job" form={form} onChange={set} errors={errors}>
                {JOBS.map(j => <option key={j} value={j}>{j}</option>)}
              </Sel>
            </Field>
            <Field name="marital" label="Marital Status" errors={errors}>
              <Sel name="marital" form={form} onChange={set} errors={errors}>
                {["married","single","divorced"].map(m => <option key={m} value={m}>{m}</option>)}
              </Sel>
            </Field>
            <Field name="education" label="Education" errors={errors}>
              <Sel name="education" form={form} onChange={set} errors={errors}>
                {["primary","secondary","tertiary","unknown"].map(e => <option key={e} value={e}>{e}</option>)}
              </Sel>
            </Field>
            <Field name="default" label="Has Credit Default?" hint="Has credit in default?" errors={errors}>
              <Sel name="default" form={form} onChange={set} errors={errors}>
                {["yes","no"].map(v => <option key={v} value={v}>{v}</option>)}
              </Sel>
            </Field>
            <Field name="balance" label="Account Balance (€)" hint="Average yearly balance" errors={errors}>
              <Inp name="balance" type="number" placeholder="e.g. 1357" form={form} onChange={set} errors={errors} />
            </Field>
            <Field name="housing" label="Housing Loan?" errors={errors}>
              <Sel name="housing" form={form} onChange={set} errors={errors}>
                {["yes","no"].map(v => <option key={v} value={v}>{v}</option>)}
              </Sel>
            </Field>
            <Field name="loan" label="Personal Loan?" errors={errors}>
              <Sel name="loan" form={form} onChange={set} errors={errors}>
                {["yes","no"].map(v => <option key={v} value={v}>{v}</option>)}
              </Sel>
            </Field>
          </div>
        </div>

        {/* ── Section: Campaign Info ── */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Campaign Information</div>
          <div className="form-grid form-grid-3">
            <Field name="contact" label="Contact Type" errors={errors}>
              <Sel name="contact" form={form} onChange={set} errors={errors}>
                {["cellular","telephone","unknown"].map(v => <option key={v} value={v}>{v}</option>)}
              </Sel>
            </Field>
            <Field name="day" label="Last Contact Day" hint="Day of month (1–31)" errors={errors}>
              <Inp name="day" type="number" placeholder="e.g. 5" min={1} max={31} form={form} onChange={set} errors={errors} />
            </Field>
            <Field name="month" label="Last Contact Month" errors={errors}>
              <Sel name="month" form={form} onChange={set} errors={errors}>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </Sel>
            </Field>
            <Field name="duration" label="Call Duration (sec)" hint="Last contact duration in seconds" errors={errors}>
              <Inp name="duration" type="number" placeholder="e.g. 261" min={0} form={form} onChange={set} errors={errors} />
            </Field>
            <Field name="campaign" label="Contacts (this campaign)" hint="Number of contacts performed during this campaign" errors={errors}>
              <Inp name="campaign" type="number" placeholder="e.g. 1" min={1} form={form} onChange={set} errors={errors} />
            </Field>
          </div>
        </div>

        {/* ── Section: Previous Campaign ── */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-title">Previous Campaign</div>
          <div className="form-grid form-grid-3">
            <Field name="pdays" label="Days Since Last Contact" hint="-1 means not previously contacted" errors={errors}>
              <Inp name="pdays" type="number" placeholder="e.g. -1" form={form} onChange={set} errors={errors} />
            </Field>
            <Field name="previous" label="Previous Contacts" hint="Contacts before this campaign" errors={errors}>
              <Inp name="previous" type="number" placeholder="e.g. 0" min={0} form={form} onChange={set} errors={errors} />
            </Field>
            <Field name="poutcome" label="Previous Outcome" errors={errors}>
              <Sel name="poutcome" form={form} onChange={set} errors={errors}>
                {POUTCOMES.map(v => <option key={v} value={v}>{v}</option>)}
              </Sel>
            </Field>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Predicting…</> : <><Brain size={18} /> Predict Subscription</>}
          </button>
        </div>
      </form>

      {/* ── Result ── */}
      {result && (
        <div style={{ marginTop: 32 }} className="fade-in">
          <div className={`result-card ${result.prediction === "yes" ? "result-yes" : "result-no"}`}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
                  Prediction
                </div>
                <div className="result-prediction">
                  {result.prediction === "yes" ? "✓ YES" : "✗ NO"}
                </div>
                <div className="result-subtitle">
                  Customer will {result.prediction === "yes" ? "" : "NOT "}subscribe to a term deposit
                </div>
                <div style={{ fontSize: ".875rem", color: "var(--text-muted)", marginBottom: 12 }}>
                  {result.interpretation}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span className={`badge ${result.prediction === "yes" ? "badge-yes" : "badge-no"}`}>
                    {result.prediction.toUpperCase()}
                  </span>
                  <span className="badge badge-navy">
                    Confidence: {(result.confidence * 100).toFixed(1)}%
                  </span>
                  <span className="badge badge-navy">{result.model_name}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>
                  Probability Breakdown
                </div>
                <ProbabilityBar probYes={result.prob_yes} probNo={result.prob_no} />
                <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ textAlign: "center", padding: "12px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #86efac" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#16a34a" }}>
                      {(result.prob_yes * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: ".75rem", color: "#166534" }}>P(Subscribe)</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "12px", background: "#fff1f2", borderRadius: 8, border: "1px solid #fca5a5" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#dc2626" }}>
                      {(result.prob_no * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: ".75rem", color: "#991b1b" }}>P(No Subscribe)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
