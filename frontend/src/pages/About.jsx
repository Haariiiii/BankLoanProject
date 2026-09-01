export default function About() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>About This Project</h1>
        <p>Bank Marketing Response Prediction using Machine Learning</p>
      </div>

      <div className="card-grid card-grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">Project Overview</div>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.9, fontSize: ".875rem" }}>
            This application predicts whether a bank customer will subscribe to a term deposit
            based on their demographic information and details of the marketing campaign.
            The model was trained on the UCI Bank Marketing dataset from a Portuguese banking institution.
          </p>
        </div>
        <div className="card">
          <div className="card-title">Tech Stack</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["Python 3.x", "scikit-learn 1.7.2", "pandas", "numpy", "Flask 3.x",
              "Flask-CORS", "imbalanced-learn (SMOTE)", "SQLite", "React 18",
              "Vite", "Recharts", "Axios", "React Router", "Lucide Icons"
            ].map(t => (
              <span key={t} className="badge badge-navy">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">ML Pipeline</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { step: "1", title: "Data Loading", desc: "bank-full.csv — 45,211 records, semicolon-separated" },
            { step: "2", title: "Preprocessing", desc: "Education ordinal encoding + OHE for 8 categorical columns → 40 features" },
            { step: "3", title: "Train/Test Split", desc: "70% training, 30% test (random_state=42)" },
            { step: "4", title: "SMOTE Balancing", desc: "Training only: oversample minority class from 11.7% → 50%" },
            { step: "5", title: "Model Training", desc: "Random Forest: 200 estimators, random_state=42" },
            { step: "6", title: "Evaluation", desc: "Accuracy 90%, ROC-AUC 0.923 on unbalanced test set" },
          ].map(({ step, title, desc }) => (
            <div key={step} style={{ background: "#f8fafc", borderRadius: 8, padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, background: "var(--teal)", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: ".85rem", flexShrink: 0 }}>
                  {step}
                </div>
                <strong style={{ fontSize: ".9rem" }}>{title}</strong>
              </div>
              <p style={{ fontSize: ".82rem", color: "var(--text-muted)", lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Dataset Features</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Feature</th><th>Type</th><th>Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["age",       "Numerical",   "Client age (years)"],
                ["job",       "Categorical", "Type of job (12 categories)"],
                ["marital",   "Categorical", "Marital status (married/single/divorced)"],
                ["education", "Ordinal",     "Education level (primary < secondary < tertiary)"],
                ["default",   "Binary",      "Has credit in default?"],
                ["balance",   "Numerical",   "Average yearly balance (€)"],
                ["housing",   "Binary",      "Has housing loan?"],
                ["loan",      "Binary",      "Has personal loan?"],
                ["contact",   "Categorical", "Contact communication type"],
                ["day",       "Numerical",   "Last contact day of month"],
                ["month",     "Categorical", "Last contact month of year"],
                ["duration",  "Numerical",   "Last contact duration (seconds)"],
                ["campaign",  "Numerical",   "Number of contacts in this campaign"],
                ["pdays",     "Numerical",   "Days since last campaign contact (-1 = never)"],
                ["previous",  "Numerical",   "Contacts before this campaign"],
                ["poutcome",  "Categorical", "Outcome of previous marketing campaign"],
              ].map(([f, t, d]) => (
                <tr key={f}>
                  <td><code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, fontSize: ".82rem" }}>{f}</code></td>
                  <td><span className="badge badge-navy" style={{ fontSize: ".72rem" }}>{t}</span></td>
                  <td style={{ color: "var(--text-muted)", fontSize: ".875rem" }}>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
