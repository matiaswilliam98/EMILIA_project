import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LoginPopup from "../components/LoginPopup/LoginPopup";
import Dashboard from "../pages/Dashboard";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPopup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
