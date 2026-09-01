export default function ProbabilityBar({ probYes, probNo }) {
  return (
    <div className="prob-bar-wrap">
      <div className="prob-bar-row">
        <span className="prob-bar-label" style={{ color: "#16a34a" }}>Yes</span>
        <div className="prob-bar-track">
          <div
            className="prob-bar-fill bar-yes"
            style={{ width: `${(probYes * 100).toFixed(1)}%` }}
          />
        </div>
        <span className="prob-bar-pct" style={{ color: "#16a34a" }}>
          {(probYes * 100).toFixed(1)}%
        </span>
      </div>
      <div className="prob-bar-row">
        <span className="prob-bar-label" style={{ color: "#dc2626" }}>No</span>
        <div className="prob-bar-track">
          <div
            className="prob-bar-fill bar-no"
            style={{ width: `${(probNo * 100).toFixed(1)}%` }}
          />
        </div>
        <span className="prob-bar-pct" style={{ color: "#dc2626" }}>
          {(probNo * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
