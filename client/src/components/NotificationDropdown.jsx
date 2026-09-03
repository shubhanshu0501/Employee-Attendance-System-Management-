import React, { useEffect, useRef } from "react";
import {
    Bell,
    CheckCircle2,
    XCircle,
    FileText,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    CheckCheck,
    Inbox
} from "lucide-react";
import "./NotificationDropdown.css";

function NotificationDropdown({
    isOpen,
    onClose,
    notifications = [],
    onMarkAsRead,
    onMarkAllAsRead
}) {
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    function renderIcon(type) {
        switch (type) {
            case "checkin":
                return <ArrowUpRight className="notif-icon emerald" size={16} />;
            case "checkout":
                return <ArrowDownLeft className="notif-icon amber" size={16} />;
            case "leave_applied":
                return <FileText className="notif-icon indigo" size={16} />;
            case "leave_approved":
                return <CheckCircle2 className="notif-icon emerald" size={16} />;
            case "leave_rejected":
                return <XCircle className="notif-icon rose" size={16} />;
            case "hr_leave_pending":
                return <Clock className="notif-icon amber" size={16} />;
            default:
                return <Bell className="notif-icon cyan" size={16} />;
        }
    }

    return (
        <div className="notification-dropdown-menu" ref={dropdownRef}>
            <div className="notif-dropdown-header">
                <div className="notif-header-title">
                    <h4>Notifications</h4>
                    {unreadCount > 0 && (
                        <span className="notif-unread-badge">{unreadCount} new</span>
                    )}
                </div>

                {unreadCount > 0 && (
                    <button className="notif-mark-all-btn" onClick={onMarkAllAsRead}>
                        <CheckCheck size={14} />
                        <span>Mark all as read</span>
                    </button>
                )}
            </div>

            <div className="notif-dropdown-body">
                {notifications.length === 0 ? (
                    <div className="notif-empty-state">
                        <Inbox size={32} className="notif-empty-icon" />
                        <p className="notif-empty-title">You're all caught up!</p>
                        <span className="notif-empty-subtitle">No notifications to display right now.</span>
                    </div>
                ) : (
                    notifications.map((item) => (
                        <div
                            key={item.id}
                            className={`notif-item ${!item.isRead ? "unread" : ""}`}
                            onClick={() => onMarkAsRead(item.id)}
                        >
                            <div className="notif-item-icon-box">
                                {renderIcon(item.type)}
                            </div>

                            <div className="notif-item-content">
                                <div className="notif-item-row">
                                    <span className="notif-item-title">{item.title}</span>
                                    <span className="notif-item-time">{item.time}</span>
                                </div>
                                <p className="notif-item-message">{item.message}</p>
                            </div>

                            {!item.isRead && <span className="notif-unread-dot" title="Unread"></span>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default NotificationDropdown;
