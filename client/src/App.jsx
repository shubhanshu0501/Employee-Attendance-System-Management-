import "./App.css";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import HRDashboard from "./pages/HRDashboard";

function EmployeeRoute() {
    let employee = null;
    try {
        const stored = localStorage.getItem("employee");
        if (stored) {
            employee = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Error parsing employee from localStorage:", e);
        employee = null;
    }

    if (!employee) {
        return <Navigate to="/login" replace />;
    }

    const role = (employee.role || "employee").toLowerCase();
    if (role === "hr" || role === "admin") {
        return <Navigate to="/hr-dashboard" replace />;
    }

    return <Dashboard />;
}

function HRRoute() {
    let employee = null;
    try {
        const stored = localStorage.getItem("employee");
        if (stored) {
            employee = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Error parsing employee from localStorage:", e);
        employee = null;
    }

    if (!employee) {
        return <Navigate to="/login" replace />;
    }

    const role = (employee.role || "employee").toLowerCase();
    if (role !== "hr" && role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return <HRDashboard />;
}

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={<EmployeeRoute />}
                />

                <Route
                    path="/hr-dashboard"
                    element={<HRRoute />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;