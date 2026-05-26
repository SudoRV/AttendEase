import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedDashboard from "./components/ProtectedDashboard";
import { GlobalProvider } from "./services/states";
import { ThemeProvider } from "./context/ThemeContext";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import BLETechPage from "./pages/BLETechPage";
import TeamPage from "./pages/TeamPage";
import DownloadApp from "./pages/DownloadApp";

function App() {
  return (
    <ThemeProvider>
      <GlobalProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/ble" element={<BLETechPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/download" element={<DownloadApp />} />

            {/* Auth Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<ProtectedDashboard />} />
          </Routes>
        </BrowserRouter>
      </GlobalProvider>
    </ThemeProvider>
  );
}

export default App;
