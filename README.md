# Safe Speech - Advanced Attendance & Automation Platform

A state-of-the-art, secure, and mobile-first attendance management system. Designed for educational institutions and corporate events, this platform combines cryptographic QR security with real-time geolocation verification and automated n8n workflows.

---

## 🔐 Administrative Credentials (Local Dev)
To access the management dashboard, use the following credentials:
- **Admin Email**: `admin@faculty.edu`
- **Password**: `password123`

---

## ✨ Key Features

### 1. High-Security Attendance
- **Dynamic QR Validation**: QR codes rotate every **90 seconds**. Each token is cryptographically signed using JWT (`jose`) and is timestamped to prevent reuse or photo-sharing.
- **GPS Geo-fencing**: Participants must be within the specified radius (e.g., 200m) of the event coordinates to successfully check in.
- **Real-Time Identification**: Automatic lookup for pre-registered participants with a seamless "Walk-in" registration flow for new arrivals.

### 2. Admin Infrastructure
- **Comprehensive Dashboard**: View real-time attendance counts, active sessions, and participant statistics.
- **Bulk Import**: Intelligent Excel and CSV uploader that automatically maps columns (Name, Email, Phone) even with different headers.
- **Live Monitoring**: Track "Present" vs "Absent" records as they happen.

### 3. n8n Automation Integration
- **Automated Certificates**: Triggers a webhook on every check-in to generate and email PDF certificates to participants.
- **Absence Reporting**: One-click "Sync Absences" pushes a detailed report of missing participants to your automation server.

### 4. User Experience
- **Multilingual Support**: Fully localized interface supporting **English** and **Turkish**.
- **Glassmorphism UI**: A premium, modern design with dark/light mode support and smooth animations via Framer Motion.
- **Safari Optimized**: Purpose-built geolocation flow that satisfies strict mobile browser permissions.

---

## 🚀 Tech Stack
- **Framework**: Next.js 16 (App Router + Turbopack)
- **Language**: TypeScript
- **Database**: Neon (PostgreSQL)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion
- **Automation**: n8n Webhooks

---

## 🛠️ Installation & Setup

1. **Clone and Install**:
```bash
npm install
```

2. **Environment Variables**:
Create a `.env` file in the root:
```env
DATABASE_URL="your_neon_postgres_url"
JWT_SECRET="your_secure_secret"
N8N_WEBHOOK_URL="http://localhost:5678/webhook/..."
```

3. **Database Setup**:
```bash
npx drizzle-kit push
npm run seed
```

4. **Run Development**:
```bash
npm run dev
```

---

## 📁 Core Directory Map
- `src/app/admin`: Management portal and authentication.
- `src/app/scan`: The "Live" participant check-in portal.
- `src/app/admin/event/[id]/qr`: The rotating QR projection page.
- `src/lib/automation.ts`: Webhook trigger logic for n8n.
- `src/lib/translations.ts`: Central i18n configuration.
