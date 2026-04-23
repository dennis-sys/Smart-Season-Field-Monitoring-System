# SmartSeason Field Monitoring System

## 🚀 Setup Instructions
1. Create a Supabase project. Run `supabase-setup.sql` in the SQL Editor.
2. Create two users in Supabase Auth (email/password). Insert their IDs into `profiles` with roles `admin` and `field_agent`.
3. Copy `.env` files to `backend/` and `frontend/` and fill in your Supabase credentials.
4. Run `npm install` in both folders.
5. Start backend: `cd backend && npm run dev`
6. Start frontend: `cd frontend && npm run dev`
7. Access app at `http://localhost:5173`

## 🧠 Design Decisions & Assumptions
- **Auth Flow**: Supabase Auth handles login/signup. JWT is stored locally and passed to Node.js backend via `Authorization` header. User role/ID is attached via custom headers for simplicity. In production, backend should decode & verify JWT.
- **Status Logic**: Computed server-side on fetch. 
  - `Completed`: Stage is `Harvested`
  - `At Risk`: No update in >14 days OR >90 days since planting while still `Growing`
  - `Active`: Otherwise
- **RLS**: Disabled for assessment speed. Enable `row_level_security` in Supabase for production.
- **Stack Choice**: Node/Express for clear API routing & business logic separation. React+Vite+Tailwind for fast, modern UI. Supabase handles DB + Auth efficiently.

## 🔑 Demo Credentials
- Admin: `admin@smartseason.com` / `password123`
- Agent: `agent@smartseason.com` / `password123`
*(Create these in Supabase Auth UI first)*

## 📦 Architecture
- `/backend`: Express REST API, Supabase client, middleware, status logic
- `/frontend`: React SPA, Axios API client, AuthContext, role-based routing