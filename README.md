# 🍽️ DineSync - Premium Multi-Tenant Restaurant SaaS Platform

A state-of-the-art, full-stack multi-tenant restaurant and cloud kitchen management platform. Designed with rich glassmorphism aesthetics, live WebSocket updates, secure online payments, and robust multi-container cloud infrastructure.

---

## ✨ Key Features

### 🎨 Frontend Experience (React + Vite)
- **Dynamic Multi-Tenant Storefronts**: Resolves localized themes, custom branding, and menus instantly based on active tenant slugs (e.g., *Pizza Kings*).
- **Premium UI/UX**: Built with **Tailwind CSS** and **Framer Motion** to deliver smooth page transitions, micro-animations, and a responsive Glassmorphism aesthetic.
- **State Management**: Centralized application state optimized via **Redux Toolkit**.
- **Real-Time Order Tracking**: Integrates **Socket.io-client** for instant order status alerts and live status progression.
- **Location & Mapping**: Embedded **Google Maps API** integration for accurate user address mapping and smooth delivery estimation.

### ⚙️ Backend Architecture (Node.js + Express)
- **Secure Authentication**: Robust **JWT-based identity management** incorporating short-lived Access Tokens, long-lived Refresh Tokens, and automatic role-based access control (RBAC).
- **Real-Time Engine**: Dedicated **Socket.io** manager handling bi-directional updates for active order queues, real-time messaging, and admin dashboard notifications.
- **Cloud Media Storage**: Direct **Cloudinary** integration optimized for fast, secure upload and retrieval of restaurant item graphics and branding assets.
- **Payment Gateway Protocols**: Integrated **Razorpay API** and dynamic **UPI QR Code Generation** enforcing secure order settlement before delivery completion.
- **Automated Alerts**: Configured with **Nodemailer** SMTP templates to trigger instant transactional order summaries and digital receipts.

### 🚀 Infrastructure & DevOps
- **Dockerized Full-Stack**: Fully containerized setup mapping internal databases, backend microservices, and static file web roots flawlessly.
- **Multi-Stage Frontend Build**: Compiles raw React packages securely into production-ready static assets served via an integrated **Nginx Web Server** with client-side SPA route fallbacks.
- **Reverse Proxy**: Pre-configured Nginx upstreams intercepting and forwarding `/api`, `/socket.io`, and static `/uploads` endpoints internally to avoid browser CORS warnings.
- **Cloud CI/CD Ready**: Ships natively with **Vercel blueprint configurations (`vercel.json`)** and **Render infrastructure specs (`render.yaml`)** enabling seamless 1-click cloud deployments.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Redux Toolkit, Tailwind CSS, Framer Motion, Axios, Socket.io-client |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), Socket.io, JWT, Cloudinary, Razorpay, Nodemailer |
| **DevOps** | Docker, Docker Compose, Nginx, Vercel, Render |

---

## 📦 Getting Started Locally

### 1. Running via Docker Compose (Recommended)
Launch the entire localized ecosystem instantly without configuring external local databases:

```bash
# Build and start services in detached mode
docker compose up -d --build
```
- **Live Frontend Web App**: Access immediately at `http://localhost:8080`
- **Backend API Layer**: Listening internally at `http://localhost:5001/api`
- **Database Inspection**: Connect externally via MongoDB Compass at `localhost:27018`

### 2. Running Manual Dev Servers
To run isolated layers for source code iteration:

```bash
# Terminal 1: Start Backend server
cd backend
npm install
npm run dev

# Terminal 2: Start Frontend Vite server
cd frontend
npm install
npm run dev
```

---

## ☁️ Cloud Deployment Workflow

### Deploying Backend to Render
1. Connect your repository to [Render](https://render.com) using the **Blueprint** mechanism. Render automatically resolves configuration instructions from `render.yaml`.
2. Supply your live MongoDB Atlas connection string inside the environment panel.
3. Save your live service URL.

### Deploying Frontend to Vercel
1. Import the repository into [Vercel](https://vercel.com) and assign the project root to `frontend`.
2. Add your Render backend web URL under the `VITE_API_URL` environment variable.
3. Deploy to publish your client-side interface instantly.
