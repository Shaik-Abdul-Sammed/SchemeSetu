# SchemeSetu (संगमसेतु / SchemeSetu) — Smart India Hackathon 2026

> **AI-Driven Voice-First Multilingual Government Scheme Discovery & Financial Assistance Platform**  
> *Target Problem Statement SIH26092 — Empowering Scheduled Caste (SC) & Marginalized Micro-Entrepreneurs*

---

## 📌 Executive Overview

**SchemeSetu** is a production-grade, voice-first Progressive Web App (PWA) and Mobile Application designed to eliminate informational, linguistic, and procedural barriers for marginalized citizens seeking government welfare and loan assistance schemes across Central and State Governments.

### Core Value Proposition
- **Voice-First AI Conversational Assistant**: Speech recognition (`Web Speech API`) allowing low-literacy citizens to speak in their native dialect instead of filling complex forms.
- **Explainable AI Eligibility Engine**: Transparent, human-understandable rule breakdown (e.g. `✅ Household income ₹2.4L < ₹5L ceiling`).
- **Interactive Financial EMI Calculator**: Real-time loan repayment slider visualization with moratorium period support.
- **Snapchat Location Radar & GIS Partner Locator**: Pinpointing nearby bank branches & Common Service Centers (CSCs) with real-time fund availability indicators and Google Maps navigation.
- **Agent Assisted Fast-Fill Mode**: Enables CSC operators to register citizens in bulk and issue pre-filled summary PDF slips.
- **100% Localization**: Fully translated across **8 Indian languages** (English, Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Marathi).

---

## 🛠️ Architecture & Technology Stack

```text
               Citizen / User Interface
        (Web App / Capacitor Mobile / PWA)
                         │
      ┌──────────────────┴──────────────────┐
      ▼                                     ▼
Frontend (React 18 + Vite)           PWA & Offline Worker
• Speech Recognition & TTS           • Service Worker (sw.js)
• 8-Language i18n Context            • Web Manifest (manifest.json)
• Recharts & Map Locator             • IndexedDB / LocalStorage Queue
      │                                     │
      └──────────────────┬──────────────────┘
                         ▼
             Backend REST API (Node.js + Express)
             • Auth & JWT User Isolation
             • Scheme Discovery Engine
             • Partner Locator & Haversine GIS
             • PDFKit Application Generator
                         │
      ┌──────────────────┴──────────────────┐
      ▼                                     ▼
AI/ML Ranking Microservice            Data Storage & Seeders
(Python Flask / Hybrid Ranker)        (JSON / PostgreSQL Schemas)
```

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Lucide Icons | Responsive UI, PWA, Voice Assistant, Light/Dark/Contrast themes |
| **Mobile Runtime** | Capacitor JS (`capacitor.config.json`) | Geolocation, Storage, Native Browser navigation wrappers |
| **Backend API** | Node.js, Express, JWT, bcrypt, PDFKit | RESTful API, Authorization boundaries, PDF slip generator |
| **AI/ML Engine** | Python, Flask, Scikit-Learn | Hybrid rule-based + ML ranking by match score & interest rates |
| **Database** | PostgreSQL / Structured JSON Seeders | 4,700+ scheme records, 100+ partner bank branch locations |

---

## 🚀 Running the Application Locally

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Python**: `v3.9+` (Optional, if running Flask ML microservice)

### Step 1: Clone & Configure Environment Variables
```bash
git clone https://github.com/Shaik-Abdul-Sammed/SchemeSetu.git
cd SchemeSetu
```

Ensure environment files are configured:
- **Frontend** (`frontend/.env`):
  ```env
  VITE_API_URL=http://localhost:5000/api/v1
  ```
- **Backend** (`backend/.env`):
  ```env
  PORT=5000
  NODE_ENV=development
  ML_SERVICE_URL=http://localhost:5001
  JWT_SECRET=schemesetu_sih_2026_super_secret_key
  ```

### Step 2: One-Line Command to Start Both Backend & Frontend
From the project root directory, run:
```bash
(cd backend && npm start) & (cd frontend && npm run dev)
```
- **Frontend URL**: `http://localhost:3000` (or `http://localhost:5173`)
- **Backend URL**: `http://localhost:5000/api/v1`

---

## 🧪 Automated Test Suite Execution

Run the complete multi-level test suite (115 passing test assertions covering API filtering, auth isolation, EMI calculator, Haversine distance, PDF generation, and 100% localization key coverage):

```bash
cd backend && NODE_ENV=test npm test
```

### Expected Output
```text
========================================
Test Suite Completed: 115 Passed, 0 Failed
========================================
```

---

## 🌐 Deployment Instructions

### 1. Frontend Deployment (Vercel / Netlify)
1. Build the production static assets:
   ```bash
   cd frontend && npm run build
   ```
2. Upload the `frontend/dist` directory or connect the GitHub repository `https://github.com/Shaik-Abdul-Sammed/SchemeSetu.git` with root directory set to `frontend`.

### 2. Backend API Deployment (Render / Heroku)
1. The backend includes a production `Procfile`:
   ```text
   web: node src/index.js
   ```
2. Deploy the `backend/` directory on Render/Heroku and configure environment variables (`PORT=5000`, `NODE_ENV=production`).

---

## 📄 License
This project is developed for **Smart India Hackathon 2026 (SIH26092)** under the MIT License.
