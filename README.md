# 🛡️ Secure Product Management System (Full-Stack)

A professional Full-Stack web application designed to manage and search store products. This project is explicitly built with high-level cybersecurity practices to prevent malicious database manipulation.

## 🚀 Features
* **Add Product Page:** Insert product names and prices with strict input validation.
* **Search Product Page:** Dynamic product filtering with parameterized SQL queries.
* **Delete Functionality:** Safely remove products from the database via a dedicated secure endpoint.
* **Cybersecurity Focus:** Fully immune to SQL Injection (SQLi) attacks and bypass tools like Burp Suite.

## 🛠️ Tech Stack
* **Frontend:** React.js, Vite, CSS3
* **Backend:** Node.js, Express.js
* **Database:** SQLite3 (SQL Database)

## 📦 How to Run Locally

### 1. Setup Backend (Server)
```bash
cd backend
npm install
node server.js
```

### 2. Setup Frontend (Client)
Open a new terminal tab:
```bash
cd frontend
npm install
npm run dev
```
