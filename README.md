# Attorney Dashboard

A professional, industry-ready Case Management System designed specifically for legal specialists to streamline their workflows, manage documentation, and track case progress with ease.

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-black?logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview
Managing multiple legal cases, clients, and deadlines can be overwhelming. **Attorney Dashboard** is a comprehensive solution developed to help attorneys organize their practice. It provides a centralized hub for case tracking, client relations, and document management, allowing legal professionals to focus on winning cases rather than administrative overhead.

---

## Features

### 🔍 Global Search
Find any case or client instantly across the entire system. Search by case title, case number, client name, or email with real-time results.

### 📋 Document & Evidence Management
Securely manage case documents and evidence. Features include PDF report generation for case summaries and case lists, upload support, and a dedicated document center.

### 🏗️ Kanban Case Workflow
Visualize your caseload with a dynamic Kanban board. Easily move cases through stages like "Open", "In Progress", "Pending Review", and "Closed" using an intuitive drag-and-drop interface.

### 📈 Advanced Analytics
Gain insights into your practice with success metrics and win rate visualization. High-priority cases and durations are automatically calculated and displayed on a sleek dashboard.

### 🔔 Smart Notifications
Stay on top of deadlines with a built-in notification center that alerts you to upcoming hearings and critical dates within the next 7 days.

### 🔐 Secure Authentication
Robust user registration and login system for attorneys, featuring JWT-secured sessions and protected routes to ensure data privacy.

---

## Tech Stack

**Frontend:**
- **React**: Modern component-based UI.
- **Lucide React**: Clean and professional iconography.
- **Recharts**: Dynamic data visualization for analytics.
- **Framer Motion**: Smooth micro-animations and transitions.
- **Vanilla CSS**: Custom-tailored, premium aesthetic.

**Backend:**
- **Node.js**: Scalable runtime environment.
- **Express**: Fast and minimalist web framework.
- **MongoDB & Mongoose**: Flexible NoSQL database and schema modeling.
- **JWT (Json Web Token)**: Stateless authentication.

---

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/chinmayiphosur/Attorney-Case-Management-Dashboard.git
   cd Attorney-Case-Management-Dashboard
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

---

## Usage
1. **Initial Setup**: Ensure your MongoDB instance is running.
2. **Start Backend**: From the `backend` folder, run `npm run dev`.
3. **Start Frontend**: From the `frontend` folder, run `npm run dev`.
4. **Access App**: Open `http://localhost:5173` in your browser.
5. **Workflow**:
   - Register a new Attorney account.
   - Use the Dashboard to view high-level metrics.
   - Add Clients and Cases via the dedicated navigation menus.
   - Use the Kanban board to manage case progress visually.

---

## Project Structure

```text
Attorney-Case-Management-Dashboard/
├── backend/
│   ├── models/            # Mongoose Schemas (Case, Client, User)
│   ├── routes/            # API Route definitions
│   ├── middleware/        # JWT Authentication
│   ├── uploads/           # Document storage
│   └── server.js          # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI (Layout, Modals)
│   │   ├── pages/         # View components (Dashboard, Kanban)
│   │   ├── utils/         # Helper functions (PDF export)
│   │   └── App.jsx        # Routing & Main logic
│   ├── public/
│   └── index.html
├── .gitignore
└── README.md
```

---

## Configuration
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
```

---

## API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new attorney account |
| **POST** | `/api/auth/login` | Authenticate and get token |
| **GET** | `/api/cases` | Retrieve all cases |
| **POST** | `/api/cases` | Create a new case |
| **GET** | `/api/clients` | Retrieve all clients |
| **GET** | `/api/search?q=query` | Global search across cases & clients |
| **POST** | `/api/documents/upload` | Upload documents to a case |

---

## Roadmap
- [ ] Role-based access control (Admin vs. Associate)
- [ ] Full Cloud Storage integration (AWS S3)
- [ ] Email notifications for upcoming hearings
- [ ] Mobile responsive application (PWA)

---

## Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License
Distributed under the MIT License. See `LICENSE` for more information.

---

## Contact
**Chinmayi Phosur**
GitHub: [chinmayiphosur](https://github.com/chinmayiphosur)

Project Link: [https://github.com/chinmayiphosur/Attorney-Case-Management-Dashboard](https://github.com/chinmayiphosur/Attorney-Case-Management-Dashboard)
