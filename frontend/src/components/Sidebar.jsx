import { NavLink } from "react-router-dom";
import {
  Brain, BarChart2, TrendingUp, History, Info
} from "lucide-react";

const NAV = [
  { to: "/",           icon: Brain,           label: "Predict" },
  { to: "/analytics",  icon: BarChart2,        label: "Analytics" },
  { to: "/model",      icon: TrendingUp,       label: "Model Performance" },
  { to: "/history",    icon: History,          label: "History" },
  { to: "/about",      icon: Info,             label: "About" },
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
