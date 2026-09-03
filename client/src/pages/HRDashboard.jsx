import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Clock,
    FileCheck,
    LogOut,
    Search,
    Calendar,
    Check,
    X,
    CheckCircle2,
    AlertCircle,
    UserCheck,
    Bell,
    Menu,
    User,
    Moon,
    Sun
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import NotificationDropdown from "../components/NotificationDropdown";
import { API_BASE_URL } from "../config/api";
import "./HRDashboard.css";

function HRDashboard() {
    const navigate = useNavigate();
    const { theme, toggleTheme, resetThemeToLight } = useTheme();

    const [summary, setSummary] = useState({
        totalEmployees: 0,
        presentToday: 0,
        pendingLeaves: 0
    });

    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ATTENDANCE & EMPLOYEE FILTERS
    const [attendanceSearch, setAttendanceSearch] = useState("");
    const [attendanceDate, setAttendanceDate] = useState("");
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");

    // Sidebar & Navigation Active State
    const [activeSection, setActiveSection] = useState("hr-dashboard-overview");
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // NOTIFICATION DROPDOWN & READ STATE
    const [notifOpen, setNotifOpen] = useState(false);
    const [readNotifIds, setReadNotifIds] = useState(() => {
        const savedRead = localStorage.getItem("notifications_read_hr_admin");
        return savedRead ? JSON.parse(savedRead) : [];
    });

    function saveReadIds(newReadIds) {
        setReadNotifIds(newReadIds);
        localStorage.setItem("notifications_read_hr_admin", JSON.stringify(newReadIds));
    }

    useEffect(() => {
        loadHRData();
    }, []);

    async function loadHRData() {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const requestOptions = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const [
                summaryResponse,
                employeesResponse,
                attendanceResponse,
                leavesResponse
            ] = await Promise.all([
                fetch(
                    `${API_BASE_URL}/api/hr/summary`,
                    requestOptions
                ),
                fetch(
                    `${API_BASE_URL}/api/hr/employees`,
                    requestOptions
                ),
                fetch(
                    `${API_BASE_URL}/api/hr/attendance`,
                    requestOptions
                ),
                fetch(
                    `${API_BASE_URL}/api/hr/leaves`,
                    requestOptions
                )
            ]);

            const summaryData = await summaryResponse.json();
            const employeesData = await employeesResponse.json();
            const attendanceData = await attendanceResponse.json();
            const leavesData = await leavesResponse.json();

            if (summaryResponse.ok) {
                setSummary(summaryData);
            }

            if (employeesResponse.ok) {
                setEmployees(employeesData.employees || []);
            }

            if (attendanceResponse.ok) {
                setAttendance(attendanceData.attendance || []);
            }

            if (leavesResponse.ok) {
                setLeaves(leavesData.leaves || []);
            }

        } catch (error) {
            console.error("HR dashboard error:", error);
            setError("Unable to load HR dashboard");
        } finally {
            setLoading(false);
        }
    }

    function formatDate(date) {
        if (!date) {
            return "--";
        }

        return new Date(date).toLocaleDateString([], {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function formatTime(time) {
        if (!time) {
            return "--:--";
        }

        return new Date(time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function getEmployeeName(employeeId) {
        const employee = employees.find(
            (item) => String(item._id) === String(employeeId)
        );

        return employee ? employee.name : "Employee";
    }

    function getEmployeeEmail(employeeId) {
        const employee = employees.find(
            (item) => String(item._id) === String(employeeId)
        );

        return employee ? employee.email : "";
    }

    // GENERATE REAL HR ADMINISTRATIVE NOTIFICATIONS FROM REAL STATE
    const generatedHRNotifications = [];

    if (summary.pendingLeaves > 0) {
        generatedHRNotifications.push({
            id: "hr_notif_pending_leaves",
            title: "Pending Leave Applications",
            message: `You have ${summary.pendingLeaves} pending leave request(s) awaiting administrative action.`,
            time: "Action Needed",
            type: "hr_leave_pending",
            isRead: readNotifIds.includes("hr_notif_pending_leaves")
        });
    }

    if (summary.presentToday > 0) {
        generatedHRNotifications.push({
            id: "hr_notif_present_today",
            title: "Workforce Attendance Update",
            message: `${summary.presentToday} out of ${summary.totalEmployees} employees have checked in today.`,
            time: "Today",
            type: "checkin",
            isRead: readNotifIds.includes("hr_notif_present_today")
        });
    }

    leaves.filter((l) => l.status === "Pending").forEach((leave) => {
        const notifId = `hr_notif_leave_${leave._id}`;
        const empName = getEmployeeName(leave.employeeId);

        generatedHRNotifications.push({
            id: notifId,
            title: `New Leave Request - ${empName}`,
            message: `${empName} applied for ${leave.leaveType} (${leave.days} days: ${formatDate(leave.startDate)} to ${formatDate(leave.endDate)}).`,
            time: formatDate(leave.startDate),
            type: "leave_applied",
            isRead: readNotifIds.includes(notifId)
        });
    });

    const unreadCount = generatedHRNotifications.filter((n) => !n.isRead).length;

    function handleMarkAsRead(id) {
        if (!readNotifIds.includes(id)) {
            saveReadIds([...readNotifIds, id]);
        }
    }

    function handleMarkAllAsRead() {
        const allIds = generatedHRNotifications.map((n) => n.id);
        saveReadIds([...new Set([...readNotifIds, ...allIds])]);
    }

    // FILTER EMPLOYEES LIVE
    const filteredEmployees = employees.filter((emp) => {
        const query = employeeSearchTerm.toLowerCase().trim();
        if (!query) return true;
        return (
            emp.name.toLowerCase().includes(query) ||
            emp.email.toLowerCase().includes(query)
        );
    });

    // FILTER ATTENDANCE LIVE
    const filteredAttendance = attendance.filter((record) => {
        const employeeName = getEmployeeName(record.employeeId).toLowerCase();
        const employeeEmail = getEmployeeEmail(record.employeeId).toLowerCase();

        const searchValue = attendanceSearch.toLowerCase().trim();

        const matchesSearch =
            !searchValue ||
            employeeName.includes(searchValue) ||
            employeeEmail.includes(searchValue);

        const matchesDate =
            !attendanceDate ||
            record.date === attendanceDate;

        return matchesSearch && matchesDate;
    });

    async function updateLeave(leaveId, action) {
        try {
            setActionLoading(true);
            setMessage("");
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/api/hr/leaves/${leaveId}/${action}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Unable to update leave");
                return;
            }

            const updatedStatus = action === "approve" ? "Approved" : "Rejected";

            // Update UI state immediately
            setLeaves((prevLeaves) =>
                prevLeaves.map((l) =>
                    String(l._id) === String(leaveId) ? { ...l, status: updatedStatus } : l
                )
            );

            setMessage(
                action === "approve"
                    ? "Leave approved successfully"
                    : "Leave rejected successfully"
            );

            await loadHRData();

        } catch (error) {
            console.error("Leave update error:", error);
            setError("Unable to connect to server");
        } finally {
            setActionLoading(false);
        }
    }

    function handleLogout() {
        localStorage.removeItem("employee");
        localStorage.removeItem("token");
        resetThemeToLight();
        navigate("/login", { replace: true });
    }

    const scrollToSection = (sectionId) => {
        setActiveSection(sectionId);
        setMobileSidebarOpen(false);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="app-container">

            {/* MOBILE SIDEBAR BACKDROP OVERLAY */}
            {mobileSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* HR SIDEBAR (250px wide) */}
            <aside className={`app-sidebar ${mobileSidebarOpen ? "open" : ""}`}>
                
                <div className="sidebar-brand">
                    <div className="brand-icon-box" style={{ background: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)" }}>
                        <Users size={18} />
                    </div>
                    <div>
                        <div className="brand-title">EMP Attendance</div>
                        <div className="brand-subtitle">HR Admin Portal</div>
                    </div>
                </div>

                <div className="sidebar-nav">
                    <div className="sidebar-section-title">HR Navigation</div>

                    <button
                        className={`nav-item ${activeSection === "hr-dashboard-overview" ? "active" : ""}`}
                        onClick={() => scrollToSection("hr-dashboard-overview")}
                    >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </button>

                    <button
                        className={`nav-item ${activeSection === "hr-employees-dir" ? "active" : ""}`}
                        onClick={() => scrollToSection("hr-employees-dir")}
                    >
                        <Users size={18} />
                        <span>Employees</span>
                    </button>

                    <button
                        className={`nav-item ${activeSection === "hr-attendance-logs" ? "active" : ""}`}
                        onClick={() => scrollToSection("hr-attendance-logs")}
                    >
                        <Clock size={18} />
                        <span>Attendance</span>
                    </button>

                    <button
                        className={`nav-item ${activeSection === "hr-leave-approval" ? "active" : ""}`}
                        onClick={() => scrollToSection("hr-leave-approval")}
                    >
                        <FileCheck size={18} />
                        <span>Leave Requests</span>
                    </button>

                    <button
                        className={`nav-item ${activeSection === "hr-profile-view" ? "active" : ""}`}
                        onClick={() => scrollToSection("hr-profile-view")}
                    >
                        <User size={18} />
                        <span>Profile / Admin</span>
                    </button>
                </div>

                <div className="sidebar-user-footer">
                    <div className="sidebar-user-profile">
                        <div className="user-avatar-sm" style={{ background: "#06B6D4" }}>
                            HR
                        </div>
                        <div className="user-info-sm">
                            <strong>HR Admin</strong>
                            <span className="role-badge-sm">Administrator</span>
                        </div>
                    </div>

                    <button className="sidebar-logout-btn" onClick={handleLogout} title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>

            </aside>

            {/* TOP NAVBAR + MAIN CONTENT */}
            <div className="app-main-layout">

                {/* TOP NAVBAR */}
                <header className="top-navbar">
                    <div className="navbar-left">
                        <button
                            className="mobile-menu-toggle"
                            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                        >
                            <Menu size={22} />
                        </button>
                        <div className="page-heading-title">HR Admin Dashboard</div>
                    </div>

                    <div className="navbar-right">
                        <div className="navbar-search">
                            <Search size={16} className="navbar-search-icon" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={employeeSearchTerm}
                                onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                            />
                            {employeeSearchTerm && (
                                <button className="navbar-search-clear" onClick={() => setEmployeeSearchTerm("")}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* DARK / LIGHT MODE TOGGLE BUTTON */}
                        <button
                            className="navbar-icon-btn"
                            onClick={toggleTheme}
                            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                        >
                            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        {/* FUNCTIONAL NOTIFICATION BELL WITH UNREAD BADGE & POPOVER */}
                        <div style={{ position: "relative" }}>
                            <button
                                className="navbar-icon-btn"
                                onClick={() => setNotifOpen(!notifOpen)}
                                title="Notifications"
                                aria-label="Notifications"
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && <span className="notification-dot"></span>}
                            </button>

                            <NotificationDropdown
                                isOpen={notifOpen}
                                onClose={() => setNotifOpen(false)}
                                notifications={generatedHRNotifications}
                                onMarkAsRead={handleMarkAsRead}
                                onMarkAllAsRead={handleMarkAllAsRead}
                            />
                        </div>

                        {/* HR USER PROFILE BOX */}
                        <div className="header-user-wrapper">
                            <div className="header-avatar" style={{ background: "#06B6D4" }}>
                                HR
                            </div>
                            <div className="header-user-meta">
                                <span className="header-user-name">HR Admin</span>
                                <span className="header-user-role">Human Resources</span>
                            </div>
                        </div>

                        <button
                            className="sidebar-logout-btn"
                            style={{ border: "1px solid var(--border-color)", padding: "6px 12px", borderRadius: "8px", gap: "6px", display: "inline-flex" }}
                            onClick={handleLogout}
                        >
                            <LogOut size={15} />
                            <span style={{ fontSize: "12.5px", fontWeight: 600 }}>Logout</span>
                        </button>
                    </div>
                </header>

                {/* MAIN BODY CONTENT */}
                <main className="content-body">

                    {/* WELCOME BANNER */}
                    <section id="hr-dashboard-overview" className="welcome-banner" style={{ background: "linear-gradient(135deg, #0284C7 0%, #4F46E5 100%)" }}>
                        <div className="welcome-banner-text">
                            <h1>HR Administration Dashboard</h1>
                            <p>Monitor workforce attendance activity, employee roster, and review leave applications.</p>
                        </div>
                        <div className="welcome-date-pill">
                            <Calendar size={16} />
                            <span>{formatDate(new Date())}</span>
                        </div>
                    </section>

                    {/* MESSAGES */}
                    {message && (
                        <div className="hr-success-message">
                            <CheckCircle2 size={18} />
                            <span>{message}</span>
                        </div>
                    )}

                    {error && (
                        <div className="hr-error-message">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* KPI CARDS */}
                    <section className="hr-kpi-grid">
                        <div className="hr-kpi-card">
                            <div className="hr-kpi-card-header">
                                <label>Total Employees</label>
                                <div className="hr-icon-badge indigo">
                                    <Users size={20} />
                                </div>
                            </div>
                            <h3>{summary.totalEmployees}</h3>
                            <span>Registered organization employees</span>
                        </div>

                        <div className="hr-kpi-card">
                            <div className="hr-kpi-card-header">
                                <label>Present Today</label>
                                <div className="hr-icon-badge emerald">
                                    <UserCheck size={20} />
                                </div>
                            </div>
                            <h3>{summary.presentToday}</h3>
                            <span>Employees checked in today</span>
                        </div>

                        <div className="hr-kpi-card">
                            <div className="hr-kpi-card-header">
                                <label>Pending Leaves</label>
                                <div className="hr-icon-badge amber">
                                    <FileCheck size={20} />
                                </div>
                            </div>
                            <h3>{summary.pendingLeaves}</h3>
                            <span>Applications awaiting action</span>
                        </div>
                    </section>

                    {/* EMPLOYEES DIRECTORY */}
                    <section id="hr-employees-dir" className="section-card">
                        <div className="card-header-bar">
                            <div>
                                <h2>Employees Directory</h2>
                                <p>Registered workforce members in the system</p>
                            </div>

                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                <div className="input-wrapper" style={{ width: "220px" }}>
                                    <input
                                        type="text"
                                        placeholder="Filter directory..."
                                        value={employeeSearchTerm}
                                        onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                                        style={{ height: "36px", fontSize: "12.5px" }}
                                    />
                                    <Search className="input-icon" size={15} />
                                </div>
                                <span className="count-pill">{filteredEmployees.length} Employees</span>
                            </div>
                        </div>

                        <div className="data-table-wrapper">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Joined Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="empty-state-box">
                                                {employeeSearchTerm ? `No employees matching "${employeeSearchTerm}"` : "No employees found."}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEmployees.map((employeeItem) => (
                                            <tr key={employeeItem._id}>
                                                <td><strong>{employeeItem.name}</strong></td>
                                                <td>{employeeItem.email}</td>
                                                <td>{formatDate(employeeItem.createdAt)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* ATTENDANCE OVERVIEW */}
                    <section id="hr-attendance-logs" className="section-card">
                        <div className="card-header-bar">
                            <div>
                                <h2>Attendance Overview</h2>
                                <p>Comprehensive employee attendance log registry</p>
                            </div>
                            <span className="count-pill">{filteredAttendance.length} Logs</span>
                        </div>

                        {/* TOOLBAR FILTERS */}
                        <div className="filter-toolbar">
                            <div className="filter-input-group" style={{ flex: 2 }}>
                                <label>Search Employee</label>
                                <input
                                    type="text"
                                    placeholder="Search by employee name or email..."
                                    value={attendanceSearch}
                                    onChange={(e) => setAttendanceSearch(e.target.value)}
                                />
                            </div>

                            <div className="filter-input-group" style={{ flex: 1 }}>
                                <label>Filter by Date</label>
                                <input
                                    type="date"
                                    value={attendanceDate}
                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                />
                            </div>

                            <button
                                className="btn-clear-filter"
                                onClick={() => {
                                    setAttendanceSearch("");
                                    setAttendanceDate("");
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>

                        <div className="data-table-wrapper">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Date</th>
                                        <th>Check In</th>
                                        <th>Check Out</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAttendance.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="empty-state-box">
                                                No attendance records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAttendance.map((record) => (
                                            <tr key={record._id}>
                                                <td><strong>{getEmployeeName(record.employeeId)}</strong></td>
                                                <td>{formatDate(record.date)}</td>
                                                <td>{formatTime(record.checkIn)}</td>
                                                <td>{formatTime(record.checkOut)}</td>
                                                <td>
                                                    <span className="hr-status present">
                                                        {record.status || "Present"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* LEAVE APPLICATIONS APPROVAL HUB */}
                    <section id="hr-leave-approval" className="section-card">
                        <div className="card-header-bar">
                            <div>
                                <h2>Leave Applications</h2>
                                <p>Review and manage pending leave requests</p>
                            </div>
                            <span className="count-pill">{leaves.length} Applications</span>
                        </div>

                        <div className="data-table-wrapper">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Type</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Days</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="empty-state-box">
                                                No leave requests found.
                                            </td>
                                        </tr>
                                    ) : (
                                        leaves.map((leave) => (
                                            <tr key={leave._id}>
                                                <td><strong>{getEmployeeName(leave.employeeId)}</strong></td>
                                                <td>{leave.leaveType}</td>
                                                <td>{formatDate(leave.startDate)}</td>
                                                <td>{formatDate(leave.endDate)}</td>
                                                <td>{leave.days}</td>
                                                <td className="reason-cell">{leave.reason}</td>
                                                <td>
                                                    <span className={`hr-status ${leave.status.toLowerCase()}`}>
                                                        {leave.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {leave.status === "Pending" ? (
                                                        <div className="action-buttons-group">
                                                            <button
                                                                className="btn-approve"
                                                                disabled={actionLoading}
                                                                onClick={() => updateLeave(leave._id, "approve")}
                                                            >
                                                                <Check size={14} />
                                                                <span>Approve</span>
                                                            </button>

                                                            <button
                                                                className="btn-reject"
                                                                disabled={actionLoading}
                                                                onClick={() => updateLeave(leave._id, "reject")}
                                                            >
                                                                <X size={14} />
                                                                <span>Reject</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="hr-no-action">Completed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* HR PROFILE SECTION */}
                    <section id="hr-profile-view" className="section-card">
                        <div className="card-header-bar">
                            <div>
                                <h2>HR Administrator Profile</h2>
                                <p>Administrative credentials and system privileges</p>
                            </div>
                        </div>

                        <div className="profile-card-content">
                            <div className="profile-avatar-large" style={{ background: "linear-gradient(135deg, #0284C7 0%, #4F46E5 100%)" }}>
                                HR
                            </div>
                            <div className="profile-details-grid">
                                <div className="profile-field">
                                    <label>Administrative Role</label>
                                    <p>HR Administrator</p>
                                </div>
                                <div className="profile-field">
                                    <label>Department</label>
                                    <p>Human Resources</p>
                                </div>
                                <div className="profile-field">
                                    <label>Privileges</label>
                                    <p>Full System Access</p>
                                </div>
                                <div className="profile-field">
                                    <label>Security Protocol</label>
                                    <p>JWT Authorization Enabled</p>
                                </div>
                            </div>
                        </div>
                    </section>

                </main>
            </div>

        </div>
    );
}

export default HRDashboard;