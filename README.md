# QR Code Attendance & Participation System

A modern, secure, and mobile-first attendance system built for the Faculty of Medicine. This system allows administrators to manage events and participants with real-time location verification and dynamic QR code security.

## 🚀 Technologies
- **Frontend**: Next.js 15 (App Router), React, Framer Motion, Tailwind CSS
- **Backend**: Next.js Server Actions, Node.js
- **Database**: Neon (PostgreSQL) with Drizzle ORM
- **Security**: jose (JWT), Geolocation API (Proximity Check)
- **Icons**: Lucide React
- **QR**: qrcode.react, html5-qrcode

## 🛠️ Build & Development
1.  **Environment Variables**:
    Create a `.env` file with the following:
    ```env
    DATABASE_URL="your-neon-database-url"
    JWT_SECRET="your-secret-key"
    ```
2.  **Installation**:
    ```bash
    npm install
    ```
3.  **Database Synchronization**:
    ```bash
    npx drizzle-kit push
    ```
4.  **Seed Data**:
    ```bash
    npm run seed
    ```
5.  **Run Development**:
    ```bash
    npm run dev
    ```

## 🔒 Security Features
- **Dynamic QR Rotation**: Token changes every 60 seconds. Each token is cryptographically signed and timestamped.
- **Location Verification**: Uses the Haversine formula to ensure participants are within a 200m radius of the event coordinates.
- **Admin Authentication**: JWT-based session management for the administrative dashboard.

## 📁 Project Structure
- `src/app/admin`: Administrative portal (Login, Dashboard, Event Management, Attendance Logs).
- `src/app/scan`: Participant scanning portal.
- `src/app/register`: Walk-in registration for non-pre-registered participants.
- `src/db/schema.ts`: Drizzle database schema definitions.
- `src/actions`: Server Actions for auth, QR, and attendance logic.
- `src/components`: Reusable UI and core scanner components.
# 1
