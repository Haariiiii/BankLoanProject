import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Predict from "./pages/Predict";
import History from "./pages/History";
import About from "./pages/About";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/"        element={<Predict />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/history" element={<History />} />
            <Route path="/about"   element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
