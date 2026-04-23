# SmartSeason Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season. Built with React, Node.js, Express, and Supabase.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Field Status Logic](#field-status-logic)
- [Design Decisions](#design-decisions)
- [Assumptions](#assumptions)
- [Demo Credentials](#demo-credentials)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)

---

## 🌾 Overview

SmartSeason helps agricultural coordinators and field agents monitor crop development through a simple, intuitive interface. The system tracks field lifecycle stages, computes health status, and enables real-time collaboration between admins and field agents.

### Key Capabilities
- ✅ Role-based access (Admin / Field Agent)
- ✅ Create and assign fields to agents
- ✅ Update field stages with observation notes
- ✅ Automatic status computation (Active / At Risk / Completed)
- ✅ Dashboard with summaries and insights
- ✅ Responsive design for mobile field use

---

## ✨ Features

### For Admins
- View all fields across the organization
- Create new fields and assign to agents
- Monitor update history across all agents
- See aggregated statistics and at-risk alerts

### For Field Agents
- View only assigned fields
- Update field stage (Planted → Growing → Ready → Harvested)
- Add observation notes to each update
- Track personal field progress

### System-Wide
- JWT-based authentication via Supabase Auth
- Real-time status computation based on business rules
- Audit trail for all field updates
- Mobile-responsive UI for field use

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | Fast, modern UI with hot reload |
| **Styling** | Tailwind CSS | Utility-first, responsive design |
| **State** | React Context + Hooks | Simple, scalable state management |
| **Backend** | Node.js + Express | Lightweight REST API |
| **Database** | Supabase (PostgreSQL) | Managed DB + Auth + Realtime |
| **Auth** | Supabase Auth | JWT tokens, email/password login |
| **HTTP** | Axios | API client with interceptors |
| **Routing** | React Router DOM | Client-side navigation |

---

## 📁 Project Structure

```
smartseason/
├── README.md
├── .gitignore
├── supabase-setup.sql          # Database schema
├── backend/
│   ├── .env                    # Server env vars (NOT committed)
│   ├── package.json
│   ├── server.js               # Express entry point
│   ├── middleware/
│   │   └── auth.js            # JWT validation middleware
│   ├── routes/
│   │   └── fields.js          # Field CRUD + stage updates
│   └── utils/
│       └── statusLogic.js     # Business logic for status computation
└── frontend/
    ├── .env                    # Client env vars (NOT committed)
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── context/
        │   └── AuthContext.jsx   # Auth state + Supabase client
        ├── api/
        │   └── client.js         # Axios instance with auth interceptors
        ├── pages/
        │   ├── Login.jsx         # Split-screen login page
        │   ├── Dashboard.jsx     # Role-based stats + field list
        │   └── FieldManager.jsx  # Create fields + update stages
        └── components/
            ├── Navbar.jsx        # Auth-aware navigation
            └── StatusBadge.jsx   # Color-coded status indicator
```

---

## 🚀 Setup Instructions (Local Development)

### Prerequisites
- Node.js v18+ 
- Git Bash (Windows) or terminal (Mac/Linux)
- Supabase account (free tier)

### Step 1: Clone & Install
```bash
# Clone repository
git clone https://github.com/dennis-sys/Smart-Season-Field-Monitoring-System.git
cd Smart-Season-Field-Monitoring-System

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase-setup.sql`
3. Go to **Project Settings → API** and copy:
   - Project URL → `SUPABASE_URL`
   - `anon` public key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Create Environment Files

**`backend/.env`**
```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NODE_ENV=development
```

**`frontend/.env`**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=http://localhost:3000
```

### Step 4: Create Demo Users in Supabase
1. Go to **Authentication → Users → Add User**
2. Create two users:
   - `admin@smartseason.com` / `admin123`
   - `agent@smartseason.com` / `agent123`
3. Run this SQL to assign roles (replace `USER_ID` with actual IDs from Auth page):
```sql
INSERT INTO profiles (id, full_name, role) VALUES
  ('USER_ID_1', 'Admin Coordinator', 'admin'),
  ('USER_ID_2', 'Field Agent', 'field_agent');
```

### Step 5: Run Locally
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔐 Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No (default: 3000) | Server port |
| `SUPABASE_URL` | ✅ | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key for server-side DB access |
| `NODE_ENV` | No | `development` or `production` |

### Frontend (`frontend/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL (client-safe) |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anon public key |
| `VITE_API_URL` | ✅ | Backend API base URL |

> ⚠️ **Never commit `.env` files**. They are excluded via `.gitignore`.

---

## 🗄️ Database Schema

### Tables

#### `profiles` (extends `auth.users`)
```sql
id UUID PK (references auth.users.id)
full_name TEXT
role TEXT CHECK (role IN ('admin', 'field_agent'))
created_at TIMESTAMPTZ
```

#### `fields`
```sql
id UUID PK
name TEXT NOT NULL
crop_type TEXT NOT NULL
planting_date DATE NOT NULL
current_stage TEXT CHECK (IN ('Planted','Growing','Ready','Harvested'))
assigned_agent_id UUID FK → profiles.id
last_update_at TIMESTAMPTZ
created_at TIMESTAMPTZ
```

#### `field_updates` (audit log)
```sql
id UUID PK
field_id UUID FK → fields.id
agent_id UUID FK → profiles.id
previous_stage TEXT
new_stage TEXT
notes TEXT
created_at TIMESTAMPTZ
```

> Row Level Security (RLS) is disabled for assessment simplicity. Enable in production.

---

## 🔌 API Endpoints

### Authentication
All endpoints require `Authorization: Bearer <JWT>` header.

### Fields
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/api/fields` | Admin, Agent | List fields (agents see only assigned) |
| `GET` | `/api/fields/:id` | Admin, Agent | Get field + update history |
| `POST` | `/api/fields` | Admin only | Create new field |
| `PATCH` | `/api/fields/:id` | Admin only | Update field details |
| `PATCH` | `/api/fields/:id/stage` | Admin, Agent | Update stage + log note |
| `GET` | `/api/fields/updates` | Admin only | Monitor all agent updates |

### Request/Response Example
```json
// POST /api/fields
{
  "name": "North Plot A",
  "crop_type": "Maize",
  "planting_date": "2026-03-15",
  "assigned_agent_id": "uuid-here"
}

// Response 201
{
  "id": "uuid",
  "name": "North Plot A",
  "crop_type": "Maize",
  "planting_date": "2026-03-15",
  "current_stage": "Planted",
  "status": "Active",
  "assigned_agent_id": "uuid",
  "created_at": "2026-04-23T..."
}
```

---

## 🧠 Field Status Logic

Status is computed server-side on each field fetch using `utils/statusLogic.js`.

### Rules
```javascript
if (current_stage === 'Harvested') {
  return 'Completed';
}

const daysSinceUpdate = (now - last_update_at) / (1000*60*60*24);
const daysSincePlanting = (now - planting_date) / (1000*60*60*24);

if (daysSinceUpdate > 14) {
  return 'At Risk';  // No recent agent update
}

if (daysSincePlanting > 90 && current_stage === 'Growing') {
  return 'At Risk';  // Taking too long to mature
}

return 'Active';  // Healthy progress
```

### Status Definitions
| Status | Meaning | Trigger Conditions |
|--------|---------|-------------------|
| **Active** | Field progressing normally | Default state |
| **At Risk** | Needs coordinator attention | • No update in 14+ days<br>• >90 days planting while still Growing |
| **Completed** | Harvest finished | `current_stage === 'Harvested'` |

> This logic is documented in the README as required and can be extended with weather data, soil metrics, etc.

---

## 💡 Design Decisions

### 1. Authentication Flow
- **Choice**: Supabase Auth + JWT passed to Express backend
- **Why**: Leverages managed auth, avoids rolling custom JWT logic
- **Trade-off**: Backend trusts frontend-sent role headers; in production, decode JWT server-side to fetch role from DB

### 2. Status Computation Location
- **Choice**: Server-side on fetch
- **Why**: Single source of truth, easy to update logic, prevents client manipulation
- **Alternative**: Could pre-compute and store, but adds complexity for minimal gain

### 3. Folder Structure
- **Choice**: Separate `frontend/` and `backend/` directories (monorepo)
- **Why**: Clear separation of concerns, easy to deploy independently to Netlify/Render
- **Alternative**: Separate repos, but adds coordination overhead for a small project

### 4. Mobile-First UI
- **Choice**: Tailwind responsive classes (`sm:`, `lg:`) + card view on mobile
- **Why**: Field agents work outdoors on phones; usability > desktop polish
- **Implementation**: Conditional table/card rendering, touch-friendly inputs

### 5. Error Handling
- **Choice**: Try/catch + user-friendly messages + console logging
- **Why**: Balance between UX and debuggability for assessment scope
- **Production**: Add centralized error service + monitoring (Sentry, etc.)

### 6. Environment Variables
- **Choice**: `.env` files + `dotenv` for backend, Vite prefix for frontend
- **Why**: Standard practice, keeps secrets out of code, works with deployment platforms

---

## ⚠️ Assumptions

1. **User Management**: Admins create field agent accounts via Supabase dashboard (no self-signup flow)
2. **Agent Assignment**: Fields are assigned by UUID; in production, add agent selection dropdown
3. **Data Validation**: Basic required-field checks; production would add Zod/Joi schema validation
4. **Security**: RLS disabled for speed; production must enable row-level security policies
5. **File Uploads**: Observation notes are text-only; photo uploads would require Supabase Storage
6. **Time Zones**: All dates stored in UTC; frontend displays in user's local time
7. **Scalability**: Free-tier Supabase/Render sufficient for assessment; production needs connection pooling, caching
8. **Testing**: Manual testing via UI; production would add Jest + Supertest suites

---

## 👤 Demo Credentials

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | `admin@smartseason.com` | `admin123` | Create fields, view all, monitor updates |
| Field Agent | `agent@smartseason.com` | `agent123` | View assigned fields, update stages |

> Create these users in Supabase Auth and insert their IDs into `profiles` table with matching roles.

---

## 🌐 Deployment Guide

### Backend → Render
1. Connect GitHub repo to [render.com](https://render.com)
2. Create **Web Service** with:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment Variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy → Copy URL (e.g., `https://smartseason-api.onrender.com`)

### Frontend → Netlify
1. Connect GitHub repo to [netlify.com](https://netlify.com)
2. Configure:
   - Base Directory: `frontend`
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL=<Render-URL>`
3. Deploy → Copy URL (e.g., `https://smartseason-app.netlify.app`)

### Post-Deploy Checklist
- [ ] Update Netlify `VITE_API_URL` to Render backend URL
- [ ] Add Netlify domain to Render CORS allowlist in `backend/server.js`
- [ ] Test login + field operations on production URLs
- [ ] Enable Supabase Row Level Security policies for production

---

## 🛠️ Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `ERR_MODULE_NOT_FOUND` on Render | Check filename casing (Linux is case-sensitive). Ensure import matches file exactly: `statusLogic.js` |
| CORS error in browser | Add Netlify URL to `cors({ origin: [...] })` in `server.js` and redeploy backend |
| Login fails after deploy | Verify `VITE_SUPABASE_URL` and `ANON_KEY` match Supabase project exactly |
| Blank page on Netlify | Ensure publish directory is `dist` (not `frontend`) and trigger "Clear cache & deploy" |
| Backend won't start on Render | Ensure `server.js` listens on `process.env.PORT` and binds to `'0.0.0.0'` |
| `.env` values not loading | Restart server after editing `.env`; Render/Netlify require env vars set in dashboard |

### Debug Tips
```bash
# Check if env vars loaded (backend)
node -e "require('dotenv').config(); console.log(process.env.SUPABASE_URL)"

# Test API endpoint locally
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/fields

# View Netlify build logs
Netlify Dashboard → Deploys → Click failed deploy → View build log

# View Render logs
Render Dashboard → Your service → Logs tab
```

---

## 📬 Submission

- **Repository**: https://github.com/dennis-sys/Smart-Season-Field-Monitoring-System.git
- **Live Demo**: 
  - Frontend: https://smart-season-monitoring.netlify.app
  - Backend: https://smart-season-field-monitoring-system-lu9x.onrender.com
- **Contact**: eng.deniskith@gmail.com

---

> **Built with ❤️ for SmartSeason**  
>Stack: React + Node.js + Supabase + Tailwind