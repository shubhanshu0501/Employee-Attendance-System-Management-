import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Clock,
    History,
    Calendar,
    User,
    LogOut,
    Bell,
    Search,
    Menu,
    ArrowUpRight,
    ArrowDownLeft,
    Timer,
    CheckCircle2,
    Send,
    FileText,
    Moon,
    Sun,
    X
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import NotificationDropdown from "../components/NotificationDropdown";
import { API_BASE_URL } from "../config/api";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const { theme, toggleTheme, resetThemeToLight } = useTheme();

    const [employee, setEmployee] = useState(null);
    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [history, setHistory] = useState([]);
    const [historyFilter, setHistoryFilter] = useState("all");

    const [leaves, setLeaves] = useState([]);
    const [leaveType, setLeaveType] = useState("Casual Leave");
    const [leaveStartDate, setLeaveStartDate] = useState("");
    const [leaveEndDate, setLeaveEndDate] = useState("");
    const [leaveReason, setLeaveReason] = useState("");
    const [leaveLoading, setLeaveLoading] = useState(false);

    // Functional Live Search & Navigation & Notification States
    const [searchTerm, setSearchTerm] = useState("");
    const [activeSection, setActiveSection] = useState("dashboard-overview");
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    
    // NOTIFICATION DROPDOWN & READ STATE
    const [notifOpen, setNotifOpen] = useState(false);
    const [readNotifIds, setReadNotifIds] = useState([]);

    function getAuthHeaders() {
        const token = localStorage.getItem("token");

        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        };
    }

    useEffect(() => {
        const storedEmployee = localStorage.getItem("employee");

        if (!storedEmployee) {
            navigate("/login");
            return;
        }

        try {
            const parsedEmployee = JSON.parse(storedEmployee);
            setEmployee(parsedEmployee);

            // Load saved read notifications for this specific employee
            const empId = parsedEmployee.id || parsedEmployee._id;
            const savedRead = localStorage.getItem(`notifications_read_${empId}`);
            if (savedRead) {
                setReadNotifIds(JSON.parse(savedRead));
            }

            fetchTodayAttendance(empId);
            fetchAttendanceHistory(empId);
            fetchLeaves();
        } catch (e) {
            console.error("Invalid employee format:", e);
            localStorage.removeItem("employee");
            localStorage.removeItem("token");
            navigate("/login");
        }
    }, [navigate]);

    // SAVE READ NOTIFICATION IDS TO LOCALSTORAGE PER LOGGED IN EMPLOYEE
    function saveReadIds(newReadIds) {
        setReadNotifIds(newReadIds);
        if (employee) {
            const empId = employee.id || employee._id;
            localStorage.setItem(`notifications_read_${empId}`, JSON.stringify(newReadIds));
        }
    }

    async function fetchTodayAttendance(employeeId) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/attendance/today/${employeeId}`,
                {
                    headers: getAuthHeaders()
                }
            );

            const data = await response.json();

            if (data.attendance) {
                setCheckIn(data.attendance.checkIn);
                setCheckOut(data.attendance.checkOut);
            }
        } catch (error) {
            console.error("Error fetching today's attendance:", error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchAttendanceHistory(employeeId) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/attendance/history/${employeeId}`,
                {
                    headers: getAuthHeaders()
                }
            );

            const data = await response.json();

            setHistory(data.attendance || []);
        } catch (error) {
            console.error("Error fetching attendance history:", error);
        }
    }

    async function handleCheckIn() {
        if (!employee) return;

        setActionLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/attendance/checkin`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        employeeId: employee.id
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Check-in failed");
                return;
            }

            setCheckIn(data.attendance.checkIn);
            setCheckOut(data.attendance.checkOut);

            setMessage("Check-in successful");

            fetchAttendanceHistory(employee.id);

        } catch (error) {
            console.error("Check-in error:", error);
            setError("Unable to connect to server");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleCheckOut() {
        if (!employee) return;

        setActionLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/attendance/checkout`,
                {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        employeeId: employee.id
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Check-out failed");
                return;
            }

            setCheckOut(data.attendance.checkOut);

            setMessage("Check-out successful");

            fetchAttendanceHistory(employee.id);

        } catch (error) {
            console.error("Check-out error:", error);
            setError("Unable to connect to server");
        } finally {
            setActionLoading(false);
        }
    }

    async function fetchLeaves() {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/leave/my`,
                {
                    headers: getAuthHeaders()
                }
            );

            const data = await response.json();

            if (response.ok) {
                setLeaves(data.leaves || []);
            }
        } catch (error) {
            console.error("Error fetching leaves:", error);
        }
    }

    async function handleApplyLeave(e) {
        e.preventDefault();

        if (!leaveStartDate || !leaveEndDate || !leaveReason.trim()) {
            setError("Please fill all leave details");
            setMessage("");
            return;
        }

        setLeaveLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/leave/apply`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        leaveType: leaveType,
                        startDate: leaveStartDate,
                        endDate: leaveEndDate,
                        reason: leaveReason.trim()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Unable to apply for leave");
                return;
            }

            setMessage("Leave application submitted successfully");

            setLeaveStartDate("");
            setLeaveEndDate("");
            setLeaveReason("");

            if (data.leave) {
                setLeaves((prevLeaves) => [data.leave, ...prevLeaves]);
            }

            await fetchLeaves();

        } catch (error) {
            console.error("Apply leave error:", error);
            setError("Unable to connect to server");
        } finally {
            setLeaveLoading(false);
        }
    }

    async function handleCancelLeave(leaveId) {
        if (!window.confirm("Are you sure you want to cancel this leave?")) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/leave/${leaveId}`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders()
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Unable to cancel leave");
                setMessage("");
                return;
            }

            setMessage("Leave cancelled successfully");
            setError("");
            setLeaves((prevLeaves) => prevLeaves.filter((l) => String(l._id) !== String(leaveId)));
            await fetchLeaves();

        } catch (error) {
            console.error("Cancel leave error:", error);
            setError("Unable to connect to server");
        }
    }

    function handleLogout() {
        localStorage.removeItem("employee");
        localStorage.removeItem("token");
        resetThemeToLight();
        navigate("/login", { replace: true });
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

    function calculateWorkingHours(checkInTime, checkOutTime) {
        if (!checkInTime || !checkOutTime) {
            return "--";
        }

        const start = new Date(checkInTime);
        const end = new Date(checkOutTime);

        const difference = end - start;

        if (difference < 0) {
            return "--";
        }

        const totalMinutes = Math.floor(
            difference / (1000 * 60)
        );

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return `${hours}h ${minutes}m`;
    }

    const isCheckedIn = Boolean(checkIn);
    const isCheckedOut = Boolean(checkOut);

    const totalRecords = history.length;

    const presentDays = history.filter(
        (record) => record.status === "Present"
    ).length;

    const completedDays = history.filter(
        (record) => record.checkOut
    ).length;

    // DYNAMIC GENERATION OF REAL EMPLOYEE NOTIFICATIONS FROM STATE & LOCALSTORAGE READ TRACKING
    const generatedNotifications = [];

    if (checkOut) {
        generatedNotifications.push({
            id: "notif_checkout_today",
            title: "Check-Out Recorded",
            message: `Checked out at ${formatTime(checkOut)}. Total working time: ${calculateWorkingHours(checkIn, checkOut)}.`,
            time: "Today",
            type: "checkout",
            isRead: readNotifIds.includes("notif_checkout_today")
        });
    }

    if (checkIn) {
        generatedNotifications.push({
            id: "notif_checkin_today",
            title: "Check-In Recorded",
            message: `Successfully punched in at ${formatTime(checkIn)}.`,
            time: "Today",
            type: "checkin",
            isRead: readNotifIds.includes("notif_checkin_today")
        });
    }

    leaves.forEach((leave) => {
        const notifId = `notif_leave_${leave._id}`;
        let title = "Leave Application";
        let type = "leave_applied";

        if (leave.status === "Approved") {
            title = "Leave Request Approved";
            type = "leave_approved";
        } else if (leave.status === "Rejected") {
            title = "Leave Request Rejected";
            type = "leave_rejected";
        } else {
            title = "Leave Application Submitted";
            type = "leave_applied";
        }

        generatedNotifications.push({
            id: notifId,
            title: title,
            message: `${leave.leaveType} (${leave.days} days: ${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}) is ${leave.status.toLowerCase()}.`,
            time: formatDate(leave.startDate),
            type: type,
            isRead: readNotifIds.includes(notifId)
        });
    });

    const unreadCount = generatedNotifications.filter((n) => !n.isRead).length;

    function handleMarkAsRead(id) {
        if (!readNotifIds.includes(id)) {
            saveReadIds([...readNotifIds, id]);
        }
    }

    function handleMarkAllAsRead() {
        const allIds = generatedNotifications.map((n) => n.id);
        saveReadIds([...new Set([...readNotifIds, ...allIds])]);
    }

    // Filtered History (Date Dropdown Filter + Live Search Term Filter)
    const filteredHistory = history.filter((record) => {
        let matchesFilter = true;
        const recordDate = new Date(record.date);
        const now = new Date();

        if (historyFilter === "thisMonth") {
            matchesFilter = (
                recordDate.getMonth() === now.getMonth() &&
                recordDate.getFullYear() === now.getFullYear()
            );
        } else if (historyFilter === "lastMonth") {
            const lastMonth = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1
            );
            matchesFilter = (
                recordDate.getMonth() === lastMonth.getMonth() &&
                recordDate.getFullYear() === lastMonth.getFullYear()
            );
        }

        const query = searchTerm.toLowerCase().trim();
        const matchesSearch = !query ||
            formatDate(record.date).toLowerCase().includes(query) ||
            (record.status && record.status.toLowerCase().includes(query)) ||
            (record.checkOut ? "completed" : "present").includes(query);

        return matchesFilter && matchesSearch;
    });

    // Filtered Leaves (Live Search Term Filter)
    const filteredLeaves = leaves.filter((leave) => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return true;
        return (
            leave.leaveType.toLowerCase().includes(query) ||
            leave.reason.toLowerCase().includes(query) ||
            leave.status.toLowerCase().includes(query)
        );
    });

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

            {/* LEFT SIDEBAR (250px wide) */}
            <aside className={`app-sidebar ${mobileSidebarOpen ? "open" : ""}`}>
                
                <div className="sidebar-brand">
                    <div className="brand-icon-box">
                        <Clock size={18} />
                    </div>
                    <div>
                        <div className="brand-title">EMP Attendance</div>
                        <div className="brand-subtitle">Employee Portal</div>
                    </div>
                </div>

                <div className="sidebar-nav">
                    <div className="sidebar-section-title">Main Navigation</div>

                    <button
                        className={`nav-item ${activeSection === "dashboard-overview" ? "active" : ""}`}
                        onClick={() => scrollToSection("dashboard-overview")}
                    >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </button>

                    <button
                        className={`nav-item ${activeSection === "today-attendance" ? "active" : ""}`}
                        onClick={() => scrollToSection("today-attendance")}
                    >
                        <Clock size={18} />
                        <span>Today's Attendance</span>
                    </button>

                    <button
                        className={`nav-item ${activeSection === "attendance-history" ? "active" : ""}`}
                        onClick={() => scrollToSection("attendance-history")}
                    >
                        <History size={18} />
                        <span>Attendance History</span>
                    </button>

                    <button
                        className={`nav-item ${activeSection === "leave-management" ? "active" : ""}`}
                        onClick={() => scrollToSection("leave-management")}
                    >
                        <FileText size={18} />
                        <span>Leave Requests</span>
                    </button>

                    <button
                        className={`nav-item ${activeSection === "employee-profile" ? "active" : ""}`}
                        onClick={() => scrollToSection("employee-profile")}
                    >
                        <User size={18} />
                        <span>Profile</span>
                    </button>
                </div>

                <div className="sidebar-user-footer">
                    <div className="sidebar-user-profile">
                        <div className="user-avatar-sm">
                            {employee?.name ? employee.name.charAt(0).toUpperCase() : "E"}
                        </div>
                        <div className="user-info-sm">
                            <strong>{employee?.name}</strong>
                            <span className="role-badge-sm">Employee</span>
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
                        <div className="page-heading-title">Employee Portal</div>
                    </div>

                    <div className="navbar-right">
                        <div className="navbar-search">
                            <Search size={16} className="navbar-search-icon" />
                            <input
                                type="text"
                                placeholder="Search logs or leaves..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button className="navbar-search-clear" onClick={() => setSearchTerm("")}>
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
                                notifications={generatedNotifications}
                                onMarkAsRead={handleMarkAsRead}
                                onMarkAllAsRead={handleMarkAllAsRead}
                            />
                        </div>

                        {/* USER PROFILE BOX */}
                        <div className="header-user-wrapper">
                            <div className="header-avatar">
                                {employee?.name ? employee.name.charAt(0).toUpperCase() : "E"}
                            </div>
                            <div className="header-user-meta">
                                <span className="header-user-name">{employee?.name}</span>
                                <span className="header-user-role">{employee?.department || "Employee"}</span>
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
                    <section id="dashboard-overview" className="welcome-banner">
                        <div className="welcome-banner-text">
                            <h1>Welcome back, {employee?.name} 👋</h1>
                            <p>Here's your personal attendance overview and daily activity tracking.</p>
                        </div>
                        <div className="welcome-date-pill">
                            <Calendar size={16} />
                            <span>{formatDate(new Date())}</span>
                        </div>
                    </section>

                    {/* KPI METRIC CARDS */}
                    <section className="kpi-grid">
                        <div className="kpi-card">
                            <div className="kpi-icon-wrapper indigo">
                                <Clock size={24} />
                            </div>
                            <div className="kpi-info">
                                <label>Total Attendance</label>
                                <h3>{totalRecords}</h3>
                                <span>Recorded entries</span>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-icon-wrapper emerald">
                                <CheckCircle2 size={24} />
                            </div>
                            <div className="kpi-info">
                                <label>Present Days</label>
                                <h3>{presentDays}</h3>
                                <span>Days checked in</span>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-icon-wrapper cyan">
                                <Timer size={24} />
                            </div>
                            <div className="kpi-info">
                                <label>Completed Days</label>
                                <h3>{completedDays}</h3>
                                <span>Checked in & out</span>
                            </div>
                        </div>
                    </section>

                    {/* TODAY'S ATTENDANCE WIDGET */}
                    <section id="today-attendance" className="attendance-widget-card">
                        <div className="widget-header">
                            <div>
                                <h2>Today's Attendance</h2>
                                <p>Manage your punch timing for today</p>
                            </div>
                            <span className="count-pill">Today</span>
                        </div>

                        <div className="time-boxes-grid">
                            <div className="time-box-card">
                                <div className="time-box-icon">
                                    <ArrowUpRight size={22} />
                                </div>
                                <div>
                                    <p>Check In</p>
                                    <h3>{formatTime(checkIn)}</h3>
                                    <span>{isCheckedIn ? "Checked in today" : "Not checked in"}</span>
                                </div>
                            </div>

                            <div className="time-box-card">
                                <div className="time-box-icon checkout">
                                    <ArrowDownLeft size={22} />
                                </div>
                                <div>
                                    <p>Check Out</p>
                                    <h3>{formatTime(checkOut)}</h3>
                                    <span>{isCheckedOut ? "Checked out today" : "Not checked out"}</span>
                                </div>
                            </div>

                            <div className="time-box-card">
                                <div className="time-box-icon working">
                                    <Timer size={22} />
                                </div>
                                <div>
                                    <p>Working Hours</p>
                                    <h3>{calculateWorkingHours(checkIn, checkOut)}</h3>
                                    <span>{isCheckedOut ? "Total hours worked" : "Available after check out"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="action-buttons-row">
                            <button
                                className="btn-checkin"
                                onClick={handleCheckIn}
                                disabled={isCheckedIn || actionLoading}
                            >
                                <ArrowUpRight size={18} />
                                <span>
                                    {actionLoading && !isCheckedIn
                                        ? "Processing..."
                                        : isCheckedIn
                                            ? "Checked In"
                                            : "Check In"}
                                </span>
                            </button>

                            <button
                                className="btn-checkout"
                                onClick={handleCheckOut}
                                disabled={!isCheckedIn || isCheckedOut || actionLoading}
                            >
                                <ArrowDownLeft size={18} />
                                <span>
                                    {actionLoading && isCheckedIn
                                        ? "Processing..."
                                        : isCheckedOut
                                            ? "Checked Out"
                                            : "Check Out"}
                                </span>
                            </button>
                        </div>

                        {message && (
                            <div className="success-message">
                                <CheckCircle2 size={18} />
                                <span>{message}</span>
                            </div>
                        )}

                        {error && (
                            <div className="error-message">
                                <span>{error}</span>
                            </div>
                        )}
                    </section>

                    {/* ATTENDANCE HISTORY */}
                    <section id="attendance-history" className="section-card">
                        <div className="card-header-bar">
                            <div>
                                <h2>Attendance History</h2>
                                <p>Log of your attendance activity history</p>
                            </div>

                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                <select
                                    className="table-filter-select"
                                    value={historyFilter}
                                    onChange={(e) => setHistoryFilter(e.target.value)}
                                >
                                    <option value="all">All Records</option>
                                    <option value="thisMonth">This Month</option>
                                    <option value="lastMonth">Last Month</option>
                                </select>
                                <span className="count-pill">
                                    {filteredHistory.length} {filteredHistory.length === 1 ? "Record" : "Records"}
                                </span>
                            </div>
                        </div>

                        {filteredHistory.length === 0 ? (
                            <div className="empty-state-box">
                                <p>{searchTerm ? `No attendance records matching "${searchTerm}"` : "No attendance records found."}</p>
                            </div>
                        ) : (
                            <div className="data-table-wrapper">
                                <table className="custom-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Check In</th>
                                            <th>Check Out</th>
                                            <th>Working Hours</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredHistory.map((record) => {
                                            const completed = Boolean(record.checkOut);
                                            return (
                                                <tr key={record._id || record.date}>
                                                    <td>{formatDate(record.date)}</td>
                                                    <td>{formatTime(record.checkIn)}</td>
                                                    <td>{formatTime(record.checkOut)}</td>
                                                    <td>{calculateWorkingHours(record.checkIn, record.checkOut)}</td>
                                                    <td>
                                                        <span className={completed ? "status-badge completed" : "status-badge present"}>
                                                            {completed ? "Completed" : "Present"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* LEAVE MANAGEMENT */}
                    <section id="leave-management" className="section-card">
                        <div className="card-header-bar">
                            <div>
                                <h2>Leave Management</h2>
                                <p>Submit leave applications and monitor pending statuses</p>
                            </div>
                        </div>

                        <div className="leave-grid-layout">
                            {/* APPLY FORM */}
                            <form className="leave-form-card" onSubmit={handleApplyLeave}>
                                <h3>Apply for Leave</h3>
                                <div className="form-group">
                                    <label>Leave Type</label>
                                    <select
                                        value={leaveType}
                                        onChange={(e) => setLeaveType(e.target.value)}
                                    >
                                        <option value="Casual Leave">Casual Leave</option>
                                        <option value="Sick Leave">Sick Leave</option>
                                        <option value="Earned Leave">Earned Leave</option>
                                        <option value="Unpaid Leave">Unpaid Leave</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={leaveStartDate}
                                        onChange={(e) => setLeaveStartDate(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={leaveEndDate}
                                        min={leaveStartDate || undefined}
                                        onChange={(e) => setLeaveEndDate(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Reason</label>
                                    <textarea
                                        value={leaveReason}
                                        onChange={(e) => setLeaveReason(e.target.value)}
                                        placeholder="Enter reason for leave..."
                                        rows="3"
                                    />
                                </div>

                                <button type="submit" className="btn-primary" disabled={leaveLoading}>
                                    <Send size={16} />
                                    <span>{leaveLoading ? "Submitting..." : "Submit Leave Request"}</span>
                                </button>
                            </form>

                            {/* LEAVE REQUESTS TABLE */}
                            <div className="leave-table-container">
                                <div className="card-header-bar" style={{ marginBottom: "16px" }}>
                                    <h3>My Leave Applications</h3>
                                    <span className="count-pill">{filteredLeaves.length} Requests</span>
                                </div>

                                {filteredLeaves.length === 0 ? (
                                    <div className="empty-state-box">
                                        <p>{searchTerm ? `No leave requests matching "${searchTerm}"` : "No leave requests found."}</p>
                                    </div>
                                ) : (
                                    <div className="data-table-wrapper">
                                        <table className="custom-table">
                                            <thead>
                                                <tr>
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
                                                {filteredLeaves.map((leave) => (
                                                    <tr key={leave._id}>
                                                        <td>{leave.leaveType}</td>
                                                        <td>{formatDate(leave.startDate)}</td>
                                                        <td>{formatDate(leave.endDate)}</td>
                                                        <td>{leave.days}</td>
                                                        <td className="reason-cell">{leave.reason}</td>
                                                        <td>
                                                            <span className={`status-badge leave-${leave.status.toLowerCase()}`}>
                                                                {leave.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {leave.status === "Pending" ? (
                                                                <button
                                                                    type="button"
                                                                    className="btn-cancel-leave"
                                                                    onClick={() => handleCancelLeave(leave._id)}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            ) : (
                                                                <span>--</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* PROFILE CARD */}
                    <section id="employee-profile" className="section-card">
                        <div className="card-header-bar">
                            <div>
                                <h2>Employee Profile</h2>
                                <p>Account credentials and department details</p>
                            </div>
                        </div>

                        <div className="profile-card-content">
                            <div className="profile-avatar-large">
                                {employee?.name ? employee.name.charAt(0).toUpperCase() : "E"}
                            </div>
                            <div className="profile-details-grid">
                                <div className="profile-field">
                                    <label>Full Name</label>
                                    <p>{employee?.name}</p>
                                </div>
                                <div className="profile-field">
                                    <label>Employee ID</label>
                                    <p>{employee?.id}</p>
                                </div>
                                <div className="profile-field">
                                    <label>Email Address</label>
                                    <p>{employee?.email}</p>
                                </div>
                                <div className="profile-field">
                                    <label>Department / Role</label>
                                    <p style={{ textTransform: "capitalize" }}>{employee?.department || "General"} ({employee?.role})</p>
                                </div>
                            </div>
                        </div>
                    </section>

                </main>
            </div>

        </div>
    );
}

export default Dashboard;