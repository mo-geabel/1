# Presentation: QR Code Attendance & Participation System
### Faculty of Medicine Case Study

## 1. Project Overview (2 mins)
- **Objective**: Rapid and secure attendance tracking for conferences and medical events.
- **Problem**: Traditional lists are slow and vulnerable to "proxy attendance" (friends marking others).
- **Solution**: High-performance Next.js application with rotating QR and GPS validation.

## 2. Technical Architecture (3 mins)
- **Frontend/Backend**: Next.js 15+ (Unified React development, Server Actions for API).
- **Database**: Neon (Serverless Postgres) with Drizzle ORM for Zero-Binary overhead.
- **Design**: Premium Dark Mode, Mobile-First responsiveness, and micro-animations with Framer Motion.

## 3. Core Security Logic (3 mins)
### A. The 60-Second Rotation
- Backend signs a JWT every minute using the event's `qrSecret`.
- Scanners must present a token that is:
    1. Cryptographically valid.
    2. Not expired (max 70s old).
- Prevents: Sharing a photo of the QR code with others who are not present.

### B. Geolocation Verification
- Participant's GPS coordinates are captured at the moment of scanning.
- Backend calculates haversine distance to the event center.
- Attendance is only valid if within the **200-meter radius**.

## 4. Admin Workflow (2 mins)
- **Login**: Secure faculty portal.
- **Event Dashboard**: Real-time stats and management.
- **Data Export**: Professional Excel export for academic reporting.

## 5. Summary & Outcomes
- **Scalable**: Built on serverless architecture (Vercel + Neon).
- **User-Centric**: Seamless "Walk-in" registration for new participants.
- **Future Ready**: Extensible schema for session-based medical credit tracking.
