# Safe Speech - Advanced Attendance & Automation Platform

A state-of-the-art, secure, and mobile-first attendance management system. Designed for educational institutions and corporate events, this platform combines cryptographic QR security with real-time geolocation verification and automated n8n workflows.

---

## 🔐 Administrative Credentials (Local Dev)
To access the management dashboard, use the following credentials:
- **Admin Email**: `admin@faculty.edu`
- **Password**: `password123`

> Passwords are hashed with **bcrypt** (10 salt rounds). The seed script auto-hashes the default password.

---

## ✨ Key Features

### 1. High-Security Attendance
- **Dynamic QR Validation**: QR codes rotate every **90 seconds**. Each token is cryptographically signed using **HMAC-SHA256** via `jose` (`SignJWT`) and timestamped to prevent reuse or screenshot-sharing.
- **GPS Geo-fencing**: Participants must be within the configured radius (default: 200m) of the event coordinates. Distance calculated using the **Haversine formula** via `geolib`.
- **Multi-Status Tracking**: Every attendance record has a status — `VALID`, `INVALID_LOCATION`, `EXPIRED_QR`, `ABSENT`, or `EXTRA` (walk-in).
- **Safari Compatibility**: Custom geolocation flow that handles Safari's user-gesture requirement for location permissions, with silent probing on mount and explicit prompts on button tap.

### 2. Smart Participant Management
- **Pre-Registration**: Bulk import participants via Excel/CSV (`xlsx` library). Auto-maps Name, Surname, Email, and Phone columns.
- **Walk-in Registration**: New arrivals scan the QR, enter their email, and complete an inline registration form — no app download required.
- **Full CRUD**: Add, edit, search, and delete individual participants through the admin dashboard.
- **Duplicate Prevention**: Unique constraint on `(event_id, email)` prevents double entries per event.

### 3. Admin Dashboard
- **Session Cards**: Grid layout showing event title, date, GPS coordinates, and live participant count.
- **One-Click Actions**: Launch Live QR, view attendance, edit event, or delete session (with cascade).
- **Auto-Refresh**: Dashboard data refreshes every 30 seconds via `router.refresh()`.
- **Breadcrumb Navigation**: Admin → Events → Attendance hierarchy.

### 4. n8n Automation Integration
- **Check-in Webhook**: Triggers on every participant check-in with full context (event, participant, status).
- **Absence Reporting**: One-click "Sync Absences" marks all no-shows after a 24-hour window and pushes a report to your automation server.
- **Non-Blocking**: All webhook calls are fire-and-forget — they never slow down the main check-in flow.

### 5. User Experience
- **Multilingual**: Fully localized interface supporting **English** and **Turkish** with a single-click toggle.
- **Dark/Light Mode**: Premium glassmorphism UI with theme switching via `next-themes`.
- **Smooth Animations**: Page transitions and micro-interactions powered by Framer Motion.
- **Interactive Maps**: Leaflet.js map picker for setting event coordinates, with manual coordinate input fallback.

---

## 🚀 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16.2 (App Router + Turbopack), React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, Framer Motion 12, Lucide React icons |
| **Database** | PostgreSQL via Neon Serverless, Drizzle ORM 0.45 |
| **Auth** | JWT (`jsonwebtoken` + `jose`), bcrypt password hashing, HttpOnly cookies |
| **QR System** | `qrcode.react` (SVG generation), `html5-qrcode` (camera scanning) |
| **Geolocation** | `geolib` (Haversine distance), Leaflet + React-Leaflet (map UI) |
| **File Processing** | `xlsx` (Excel/CSV parse & export) |
| **Automation** | n8n webhook integration |
| **Validation** | Zod 4 |

---

## 🗄️ Database Schema

```
┌─────────────┐       ┌─────────────────┐
│    Users     │       │     Events      │
├─────────────┤       ├─────────────────┤
│ id (UUID)   │       │ id (UUID)       │
│ email       │       │ title           │
│ password    │       │ description     │
│ first_name  │       │ date            │
│ last_name   │       │ latitude        │
│ role        │       │ longitude       │
│ created_at  │       │ radius (200m)   │
│ updated_at  │       │ qr_secret       │
└─────────────┘       │ created_at      │
                      │ updated_at      │
                      └────────┬────────┘
                               │ 1:N
                 ┌─────────────┴─────────────┐
                 │                           │
        ┌────────▼────────┐        ┌─────────▼────────┐
        │  Participants   │        │   Attendance     │
        ├─────────────────┤        ├──────────────────┤
        │ id (UUID)       │◄───────│ participant_id   │
        │ event_id (FK)   │        │ event_id (FK)    │
        │ email           │        │ timestamp (null) │
        │ name            │        │ latitude         │
        │ surname         │        │ longitude        │
        │ phone           │        │ status (ENUM)    │
        │ is_registered   │        └──────────────────┘
        │ created_at      │
        └─────────────────┘
        UNIQUE(event_id, email)

Status ENUM: VALID | INVALID_LOCATION | EXPIRED_QR | ABSENT | EXTRA
```

---

## 🔄 Check-in Flow

```
Participant scans QR
        │
        ▼
  validateScanAction()
  ├─ JWT token verified (jose)
  ├─ Event fetched from DB
  └─ GPS distance checked (geolib)
        │
        ▼ (valid)
  Session token issued (5min TTL)
        │
        ▼
  lookupParticipantAction()
  ├─ Email matched → auto check-in
  └─ Email not found → inline registration form
        │
        ▼
  checkInAction()
  ├─ Participant resolved or created
  ├─ Attendance record inserted
  └─ n8n webhook triggered (non-blocking)
        │
        ▼
  ✅ Access Granted
```

---

## 🛠️ Installation & Setup

1. **Clone and Install**:
```bash
git clone <repo-url>
cd task
npm install
```

2. **Environment Variables**:
Create a `.env` file in the root:
```env
DATABASE_URL="your_neon_postgres_url"
JWT_SECRET="your_secure_secret"
N8N_WEBHOOK_URL="http://localhost:5678/webhook/..."  # Optional
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
The app starts at `http://localhost:3000`.

---

## 📁 Project Structure

```
src/
├── actions/                    # Next.js Server Actions (API-less backend)
│   ├── auth.ts                 # Login (bcrypt), logout, session management
│   ├── attendance.ts           # QR validation, check-in, absence sync
│   ├── event.ts                # Event CRUD (create, update, delete)
│   ├── participants.ts         # Participant CRUD + bulk import
│   └── qr.ts                  # JWT-signed QR token generation (90s TTL)
│
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Landing page + auth portal
│   ├── scan/                   # Participant check-in scanner
│   ├── admin/
│   │   ├── dashboard/          # Admin session management grid
│   │   └── event/[eventId]/
│   │       ├── attendance/     # Participant list + bulk upload
│   │       ├── edit/           # Event edit form
│   │       └── qr/             # Live rotating QR projection
│   └── globals.css             # Design tokens (light/dark theme)
│
├── components/                 # React components
│   ├── Scanner.tsx             # QR scanner + geolocation + registration flow
│   ├── AttendanceList.tsx      # Searchable attendance table with status badges
│   ├── AdminDashboardContent.tsx  # Event cards grid with actions
│   ├── ParticipantUpload.tsx   # Excel/CSV drag-and-drop uploader
│   ├── ManualParticipantModal.tsx  # Add/edit participant modal
│   ├── EventForm.tsx           # Event create/edit form with map picker
│   ├── LocationPicker.tsx      # Leaflet interactive map component
│   ├── SyncAbsencesTrigger.tsx # 24-hour absence sync button
│   ├── AuthTabContent.tsx      # Login form component
│   ├── LanguageContext.tsx      # i18n context provider (EN/TR)
│   ├── LanguageToggle.tsx      # Language switching button
│   ├── ThemeProvider.tsx       # next-themes wrapper
│   └── ThemeToggle.tsx         # Dark/light mode toggle
│
├── db/
│   ├── schema.ts               # Drizzle ORM schema (4 tables + relations)
│   ├── index.ts                # Neon serverless DB connection
│   └── seed.ts                 # Default admin + sample event seeder
│
└── lib/
    ├── auth.ts                 # JWT secret helpers
    ├── automation.ts           # n8n webhook trigger (non-blocking)
    └── translations.ts         # Full EN/TR translation dictionary
```

---

## 🔐 Security

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: HMAC-SHA256 signed, time-limited (QR: 90s, Session: 5min, Admin: 24h)
- **HttpOnly Cookies**: Session tokens stored as httpOnly cookies (no JS access)
- **GPS Verification**: Haversine-based distance check with configurable radius
- **QR Rotation**: Codes auto-expire every 90 seconds — screenshot sharing is useless
- **Cascade Deletes**: Removing an event cleans up all related participants and attendance records
- **HTTPS Enforcement**: Geolocation API blocked on insecure contexts (with `isSecureContext` check)

---

## 🌍 Internationalization

Full bilingual support with custom translation system:
- 🇬🇧 **English** — Default
- 🇹🇷 **Türkçe** — Complete translation

All UI labels, error messages, toast notifications, and form placeholders are translated. Language preference persisted via `localStorage`.
