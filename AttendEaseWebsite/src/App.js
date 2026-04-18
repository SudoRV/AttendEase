import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedDashboard from "./components/ProtectedDashboard";
import Header from "./components/Header";
import RequestNotification from "./components/RequestNotification";
import Footer from "./components/Footer";
import StudentDashboard from "./pages/Student_Dashboard";
import Dashboard from "./components/Dashboard";
import TeacherDashboard from "./pages/Teacher_Dashboard";
import { GlobalProvider } from "./services/states";

function App() {
  return (
    <GlobalProvider>
      <BrowserRouter>
        <RequestNotification />
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<ProtectedDashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* After login */}
          <Route path="/dashboard" element={<ProtectedDashboard />} />
        </Routes>
      </BrowserRouter>
    </GlobalProvider>
  );
}

export default App;
