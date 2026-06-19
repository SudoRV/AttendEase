# AttendEase

> A centralized academic scheduling and management platform designed to streamline communication, timetable management, attendance tracking, leave management, and real-time institutional updates.

🌐 **Live Demo:** [https://attendease-nivr.onrender.com/](https://attendease-nivr.onrender.com/)

## Overview

AttendEase is a full-stack academic management system developed to eliminate communication delays, scheduling conflicts, and manual administrative workflows commonly found in educational institutions.

The platform provides dedicated dashboards for Students and Faculty, enabling real-time timetable updates, attendance monitoring, leave management, class substitutions, and announcement broadcasting through a centralized system.

## Features

### Student Features

* Real-time timetable access
* Attendance monitoring and reports
* Leave application submission
* Leave history tracking
* Instant announcements and notifications
* Faculty leave visibility
* Responsive dashboard

### Faculty Features

* Class schedule management
* Leave request portal
* Class substitution management
* Student leave approval workflow
* Announcement creation and broadcasting
* Availability tracking

### Administrative Features

* Centralized academic scheduling
* Resource conflict prevention
* Real-time communication system
* User role management
* Institutional data management

### Notification System

* Firebase Cloud Messaging (FCM)
* Real-time announcement delivery
* Class cancellation alerts
* Schedule change notifications

### Offline Communication (Research Module)

* BLE Mesh based notification propagation
* Device-to-device information sharing
* Offline academic alert distribution

---

## Technology Stack

### Frontend

* React.js
* Tailwind CSS
* Shadcn UI
* React Router

### Mobile Application

* React Native
* Android Studio

### Backend

* Node.js
* Express.js
* REST APIs
* JWT Authentication

### Database

* Microsoft SQL Server
* MySQL
* Firebase

### Notifications

* Firebase Cloud Messaging (FCM)

### Development Tools

* Git
* GitHub
* Visual Studio Code
* Android Studio
* Render

---

## System Architecture

```text
┌────────────────────┐
│    React Frontend  │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Express REST API  │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ SQL Server / MySQL │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Firebase Services  │
│ FCM Notifications  │
└────────────────────┘
```

---

## Core Modules

### Authentication & RBAC

* Student Login
* Faculty Login
* Role-Based Access Control
* JWT Authentication

### Timetable Engine

* Dynamic timetable rendering
* Schedule updates
* Class cancellation handling
* Substitution management

### Leave Management

* Faculty leave requests
* Student leave requests
* Approval workflows
* Leave history records

### Attendance System

* Attendance tracking
* Attendance analytics
* Risk analysis
* Monthly attendance reports

### Announcement System

* Institution-wide announcements
* Targeted notifications
* Real-time dashboard updates

---

## Project Structure

```text
AttendEase
│
├── AttendEaseWebsite
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   └── images
│   └── package.json
│
├── AttendEaseApp
│   ├── android
│   ├── src
│   │   ├── components
│   │   ├── screens
│   │   ├── navigation
│   │   └── database
│   └── package.json
│
└── server
    ├── static
    ├── build
    └── utility
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/attendease.git
cd attendease
```

### Frontend

```bash
cd AttendEaseWebsite

npm install

npm start
```

### Backend

```bash
cd server

npm install

npm run dev
```

### Mobile App

```bash
cd AttendEaseApp

npm install

npx react-native run-android
```

---

## Key Achievements

* Real-time academic scheduling platform
* Responsive web and mobile interfaces
* Automated faculty leave workflow
* Dynamic timetable engine
* Attendance tracking and analytics
* Secure role-based access control
* Firebase push notifications
* Cloud deployment on Render
* BLE Mesh research integration for offline communication

---

## Future Enhancements

* AI-powered timetable optimization
* Automated substitute faculty recommendations
* Advanced attendance analytics
* Multi-institution support
* Parent portal
* Offline-first synchronization
* Enhanced BLE Mesh communication network

---

## Team

| Name               | Role                         |
| ------------------ | ---------------------------- |
| Arindam            | Frontend Developer           |
| Arjun Singh        | Frontend Developer           |
| Rahul Verma        | Backend Developer            |
| Rituraj Kalkhudiya | Data Engineer                |
| Vansh Verma        | Data Engineer & Data Analyst |

---

## Project Mentor

**Mr. Rishabh Kushawah**
Assistant Professor, Department of Computer Science & Engineering
Dr. APJ Abdul Kalam Government Institute of Technology, Tanakpur

---

## License

This project was developed as a Bachelor of Technology Major Project and is intended for educational and research purposes.

---

### Live Application

🚀 [https://attendease-nivr.onrender.com/](https://attendease-nivr.onrender.com/)

### Repository Topics

```text
react
react-native
nodejs
express
sql-server
firebase
attendance-management
college-management-system
academic-scheduler
timetable-management
rbac
jwt-authentication
fcm
ble-mesh
full-stack-project
```
