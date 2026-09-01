import { NavLink } from "react-router-dom";
import { Brain, History, Info } from "lucide-react";

const NAV = [
  { to: "/",        icon: Brain,   label: "Predict" },
  { to: "/history", icon: History, label: "History" },
  { to: "/about",   icon: Info,    label: "About" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="brand">Bank<span>ML</span></div>
        <div className="tagline">Marketing Prediction Platform</div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        Random Forest · 90% Accuracy
      </div>
    </aside>
  );
}
