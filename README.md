# 💸 CHILLAR — Student Expense Tracker

> Track every rupee, save every day.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Charts | Chart.js + react-chartjs-2 |
| Deployment | Vercel (FE) + Render (BE) |

## Features

- 🔐 **JWT Auth** — Secure signup/login with bcrypt password hashing
- 💸 **Expense CRUD** — Add, edit, delete expenses with categories
- 📊 **Charts** — Pie chart (category breakdown) + Bar chart (monthly trend)
- 🎯 **Budget Alerts** — "You've spent 80% of your food budget"
- 🔍 **Filters** — Search, filter by category/month/year
- 📱 **Responsive** — Works on mobile and desktop

## Getting Started

### 1. Clone repo
```bash
git clone https://github.com/yourusername/chillar.git
cd chillar
```

### 2. Setup Backend
```bash
cd server
npm install
cp .env.example .env
# Add your MongoDB URI and JWT_SECRET
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

### 4. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create free cluster
3. Get connection string
4. Add to `server/.env` as `MONGODB_URI`

## Deploy

### Backend → Render
1. Connect GitHub repo to Render
2. Set build command: `cd server && npm install`
3. Set start command: `cd server && npm start`
4. Add environment variables

### Frontend → Vercel
1. Connect GitHub repo to Vercel
2. Set root directory: `client`
3. Add `VITE_API_URL` env variable pointing to Render URL

## API Endpoints

```
POST   /api/auth/signup          Register new user
POST   /api/auth/login           Login
GET    /api/auth/me              Get current user

GET    /api/expenses             Get all expenses (with filters)
POST   /api/expenses             Add expense
PUT    /api/expenses/:id         Update expense
DELETE /api/expenses/:id         Delete expense

GET    /api/expenses/stats/monthly   Monthly summary
GET    /api/expenses/stats/yearly    Yearly summary

GET    /api/budget               Get budget
POST   /api/budget               Set budget
```