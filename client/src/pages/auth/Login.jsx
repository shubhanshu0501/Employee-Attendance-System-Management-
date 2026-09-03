import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Clock, Calendar, UserCheck, BarChart3, CheckCircle2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { API_BASE_URL } from "../../config/api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const { resetThemeToLight } = useTheme();

    useEffect(() => {
        resetThemeToLight();
    }, [resetThemeToLight]);

    async function handleLogin(e) {
        e.preventDefault();

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Login failed");
                return;
            }

            console.log("ROLE:", data.employee?.role);
            console.log("EMPLOYEE:", data.employee);

            // Save logged-in employee & token
            localStorage.setItem(
                "employee",
                JSON.stringify(data.employee)
            );

            localStorage.setItem("token", data.token);

            const userRole = (data.employee?.role || "employee").toLowerCase();

            // Navigate directly to dashboard based on role
            if (userRole === "hr" || userRole === "admin") {
                navigate("/hr-dashboard", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }

        } catch (error) {
            console.error("Login error:", error);
            alert("Unable to connect to server");
        }
    }

    return (
        <div className="login-page">

            {/* ABSTRACT BACKGROUND DECORATIONS */}
            <div className="login-bg-decorations" aria-hidden="true">
                {/* Soft Flowing Waves SVG */}
                <svg className="bg-wave" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M-100 200 C 300 400, 700 100, 1100 350 C 1300 480, 1500 300, 1600 400" stroke="url(#waveGrad1)" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.45" />
                    <path d="M-50 650 C 400 450, 800 800, 1200 550 C 1400 420, 1550 600, 1650 500" stroke="url(#waveGrad2)" strokeWidth="2" opacity="0.35" />
                    <path d="M100 -50 C 400 300, 200 600, 600 950" stroke="url(#waveGrad1)" strokeWidth="1" opacity="0.25" />
                    <defs>
                        <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.2" />
                        </linearGradient>
                        <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.3" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Decorative Dotted Grid Patterns in Corners */}
                <div className="bg-dots bg-dots-top-left"></div>
                <div className="bg-dots bg-dots-bottom-right"></div>

                {/* Floating Minimal Outline Accent Circles with Attendance/Work Icons */}
                <div className="floating-accent accent-1">
                    <Clock size={20} />
                </div>
                <div className="floating-accent accent-2">
                    <Calendar size={22} />
                </div>
                <div className="floating-accent accent-3">
                    <UserCheck size={20} />
                </div>
                <div className="floating-accent accent-4">
                    <BarChart3 size={20} />
                </div>
                <div className="floating-accent accent-5">
                    <CheckCircle2 size={18} />
                </div>
            </div>

            {/* LOGIN CARD WRAPPER WITH AMBIENT GLOW */}
            <div className="login-card-wrapper">
                <div className="login-card-glow"></div>

                <div className="login-card">

                    {/* SUBTLE BLUE/INDIGO GRADIENT HEADER PANEL */}
                    <div className="auth-card-banner">
                        <div className="brand-badge-row" style={{ background: "rgba(255, 255, 255, 0.15)", borderColor: "rgba(255, 255, 255, 0.3)", color: "#FFFFFF" }}>
                            <div className="brand-icon-pill">
                                <Clock size={16} />
                            </div>
                            <span className="brand-badge-title">EMP Attendance Hub</span>
                        </div>

                        <h2 className="auth-banner-title">Welcome Back 👋</h2>
                        <p className="auth-banner-subtitle">
                            Log in to continue to your account dashboard
                        </p>
                    </div>

                    {/* CLEAN FORM BODY */}
                    <div className="auth-card-body">
                        <form className="auth-form" onSubmit={handleLogin}>

                            <div className="form-group">
                                <label>Email Address</label>
                                <div className="input-wrapper">
                                    <input
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <Mail className="input-icon" size={18} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <Lock className="input-icon" size={18} />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary">
                                <LogIn size={18} />
                                <span>Sign In</span>
                            </button>

                        </form>

                        <p className="register-text">
                            Don't have an account?{" "}
                            <Link to="/register">Register here</Link>
                        </p>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;