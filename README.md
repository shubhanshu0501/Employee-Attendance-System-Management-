# Employee Attendance Management System

A full-stack web application designed to manage employee attendance, working hours, leave requests, and HR operations through dedicated role-based dashboards.

## 🌐 Live Demo

https://empattendancemanagement.netlify.app

## 📂 GitHub Repository

https://github.com/Mayank-Malviyaa/employee-attendance-management-system

---

## 📌 About the Project

The Employee Attendance Management System is a full-stack application built to simulate a real-world employee attendance and leave management workflow.

The application provides separate experiences for **Employees** and **HR**, with authentication, protected routes, attendance tracking, leave management, notifications, and persistent data stored in MongoDB.

The project was also deployed to production, including frontend deployment on Netlify and backend deployment on Render.

---

## ✨ Features

### 👤 Employee

- Employee registration
- Secure login with JWT authentication
- Check In / Check Out
- Attendance history
- Working hours tracking
- Apply for leave
- Cancel leave requests
- Track leave status
- Notifications
- Dark / Light mode
- Responsive dashboard

### 🧑‍💼 HR

- HR dashboard
- Employee overview
- Attendance overview
- Leave request management
- Approve / Reject leave requests
- Administrative notifications
- Role-based protected access
- Responsive interface

---

## 🔐 Authentication & Security

- JWT-based authentication
- Role-based authorization
- Protected employee and HR routes
- Password hashing using bcrypt
- Environment variables for sensitive configuration
- MongoDB Atlas database authentication
- CORS configuration for production frontend/backend communication

> Sensitive credentials and environment variables are not included in the repository.

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- CSS
- React Router

### Backend

- Node.js
- Express.js
- MongoDB
- MongoDB Atlas
- JWT
- bcrypt

### Deployment

- Netlify - Frontend
- Render - Backend
- MongoDB Atlas - Database
- GitHub - Source Control

---

## 🏗️ Application Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React + Vite      │
                    │     Frontend        │
                    └──────────┬──────────┘
                               │
                         REST API Calls
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Node.js + Express   │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
                    Authentication /
                    Business Logic
                               │
                               ▼
                    ┌─────────────────────┐
                    │    MongoDB Atlas    │
                    │      Database       │
                    └─────────────────────┘
