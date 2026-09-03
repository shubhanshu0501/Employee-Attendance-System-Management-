import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Building2, UserPlus, Clock } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { API_BASE_URL } from "../../config/api";

function Register() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [department, setDepartment] = useState("");

    const navigate = useNavigate();
    const { resetThemeToLight } = useTheme();

    useEffect(() => {
        resetThemeToLight();
    }, [resetThemeToLight]);

    async function handleRegister(e) {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password,
                        department: department,
                        role: "employee"
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Registration failed");
                return;
            }

            console.log("Registration response:", data);

            alert("Employee registered successfully!");

            navigate("/login");

        } catch (error) {

            console.error("Registration error:", error);

            alert("Unable to connect to server");
        }
    }

    return (
        <div className="login-page">

            <div className="login-card">

                {/* SUBTLE BLUE/INDIGO GRADIENT HEADER PANEL */}
                <div className="auth-card-banner">
                    <div className="brand-badge-row" style={{ background: "rgba(255, 255, 255, 0.15)", borderColor: "rgba(255, 255, 255, 0.3)", color: "#FFFFFF" }}>
                        <div className="brand-icon-pill">
                            <Clock size={16} />
                        </div>
                        <span className="brand-badge-title">EMP Attendance Hub</span>
                    </div>

                    <h2 className="auth-banner-title">Create Account 🚀</h2>
                    <p className="auth-banner-subtitle">
                        Register as an employee to get started
                    </p>
                </div>

                {/* CLEAN FORM BODY */}
                <div className="auth-card-body">
                    <form className="auth-form" onSubmit={handleRegister}>

                        <div className="form-group">
                            <label>Full Name</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                                <User className="input-icon" size={18} />
                            </div>
                        </div>

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
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Lock className="input-icon" size={18} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <Lock className="input-icon" size={18} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Department</label>
                            <div className="input-wrapper">
                                <select
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    required
                                >
                                    <option value="">Select department</option>
                                    <option value="IT">IT</option>
                                    <option value="HR">HR</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Marketing">Marketing</option>
                                </select>
                                <Building2 className="input-icon" size={18} />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary">
                            <UserPlus size={18} />
                            <span>Create Account</span>
                        </button>

                    </form>

                    <p className="register-text">
                        Already have an account?{" "}
                        <Link to="/login">Login here</Link>
                    </p>
                </div>

            </div>

        </div>
    );
}

export default Register;