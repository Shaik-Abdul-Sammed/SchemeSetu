# SchemeSetu Backend API

> **Smart India Hackathon 2026** | **Problem Statement**: SIH26092  
> **SchemeSetu**: AI-Driven Government Scheme Matching & Facilitation Platform for Marginalized Entrepreneurs

---

## 📌 Project Purpose

SchemeSetu bridges the gap between underprivileged entrepreneurs and government financial assistance programs. The backend serves as the core intelligence engine that:
1. Receives entrepreneur profile parameters (project type, cost, income, education, location).
2. Performs multi-layered rule-based eligibility matching against central and state government schemes.
3. Computes deterministic fit scores and interfaces with ML ranking models (with an intelligent fallback).
4. Calculates accurate loan EMIs considering moratorium periods and accrued interest capitalization.
5. Uses the Haversine formula to identify nearest certified financial and implementation partners.
6. Facilitates agent application submissions and automated digital PDF document generation via PDFKit.
7. Supports optional JWT authentication and user feedback collection.

---

## 🚀 Key Features

- **Standalone Operation**: Boots and runs smoothly without requiring external databases (PostgreSQL/MongoDB) or external ML microservices.
- **Dynamic Dataset Loading & Fallback**: Automatically loads `database/seeders/data/schemes.json` and `partners.json` with robust data normalization. Falls back to realistic in-memory mock datasets if files are missing.
- **ML Ranking with Deterministic Fallback**: Connects to the external ML model with timeout protection and falls back to interest-rate-first deterministic ranking.
- **Financial Loan Calculator**: Precise monthly interest accrual during moratoriums with capitalized EMI calculation.
- **Geospatial Proximity Matching**: Haversine distance filtering for active financial partners within a configurable search radius.
- **Digital Document Generation**: Generates downloadable, styled PDF application forms directly.

---

## ⚙️ Requirements & Technology Stack

- **Runtime**: Node.js 18.0.0+
- **Framework**: Express.js 4.x
- **Module System**: JavaScript CommonJS (`require` / `module.exports`)
- **Key Packages**:
  - `express`: Core HTTP server
  - `cors`: Cross-Origin Resource Sharing
  - `body-parser`: Request payload parsing
  - `dotenv`: Environment variable configuration
  - `jsonwebtoken` & `bcrypt`: Authentication and security
  - `pdfkit`: Dynamic PDF document compilation
  - `pg`: Optional PostgreSQL client
  - `nodemailer`: Email notifications utility
  - `nodemon`: Development auto-reloading

---

## 📦 Installation & Setup

### 1. Navigate to the backend directory
```bash
cd ~/Github/SchemeSetu/backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` (or use the pre-configured `.env`):
```bash
cp .env.example .env
```

Default configuration in `.env`:
```env
PORT=5000
ML_SERVICE_URL=http://localhost:5001
JWT_SECRET=schemesetu-development-secret-change-in-production
DATABASE_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### 4. Run the Server

**Development Mode (Auto-restart on change):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

---

## 🩺 Health Check Endpoints

- `GET /api/health`
- `GET /api/v1/health`

**Response Example:**
```json
{
  "status": "OK",
  "message": "SchemeSetu Backend is running",
  "timestamp": "2026-08-27T14:45:00.000Z"
}
```

---

## 📑 API Endpoint Documentation

### 1. Schemes API

#### A. Recommend Schemes
- **Endpoint**: `POST /api/v1/schemes/recommend`
- **Description**: Recommends top 3 eligible government schemes ranked by ML service or interest rate.

**Request Payload:**
```json
{
  "projectType": "food processing",
  "cost": 250000,
  "income": 300000,
  "education": "graduate",
  "location": "Andhra Pradesh"
}
```

**Response Payload:**
```json
{
  "recommendations": [
    {
      "id": "scheme-002",
      "name": "Pradhan Mantri Mudra Yojana (PMMY) - Kishore",
      "category": "Micro Enterprise Loan",
      "projectTypes": ["manufacturing", "services", "trading", "food processing", "handicrafts", "textiles", "retail"],
      "interestRate": 7.5,
      "minLoan": 50000,
      "maxLoan": 500000,
      "tenure": "60 months",
      "tenureMonths": 60,
      "moratorium": "6 months",
      "moratoriumMonths": 6,
      "description": "Provides financial support from Rs. 50,000 up to Rs. 5 Lakhs for developing and growing micro business units.",
      "eligibility": {
        "minIncome": 0,
        "maxIncome": 500000,
        "education": ["8th pass", "10th pass", "12th pass", "graduate", "diploma", "any"],
        "locations": ["All India", "Tamil Nadu", "Andhra Pradesh", "Karnataka", "Maharashtra", "Telangana", "Delhi", "Kerala", "Uttar Pradesh"]
      },
      "matchScore": 95
    }
  ],
  "totalEligible": 3,
  "message": "Eligible schemes found successfully"
}
```

#### B. List All Schemes
- **Endpoint**: `GET /api/v1/schemes`
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 10)
  - `category` (string filter)
  - `projectType` (string filter)
  - `location` (string filter)
  - `minLoan` (number filter)
  - `maxLoan` (number filter)
  - `education` (string filter)
  - `search` (keyword search across name/description/category)

#### C. Get Scheme by ID
- **Endpoint**: `GET /api/v1/schemes/:id`
- **Response**: Full scheme object or `404 Not Found`.

---

### 2. Loan EMI Calculator

- **Endpoint**: `POST /api/v1/calculator/emi`
- **Description**: Computes monthly EMI, accrued simple interest during moratorium, and total payment.

**Request Payload:**
```json
{
  "principal": 250000,
  "annualRate": 6.5,
  "tenureMonths": 60,
  "moratoriumMonths": 6
}
```

**Response Payload:**
```json
{
  "principal": 250000,
  "accruedInterest": 8125,
  "loanAmount": 258125,
  "annualRate": 6.5,
  "tenureMonths": 60,
  "moratoriumMonths": 6,
  "repaymentMonths": 54,
  "monthlyRate": 0.00541667,
  "emi": 5523.51,
  "totalPayment": 298269.64,
  "totalInterest": 48269.64,
  "currency": "INR",
  "moratoriumAssumption": "Simple monthly interest is accrued during the moratorium period on the principal and capitalized into the total loan amount before standard EMI calculation across the remaining repayment tenure."
}
```

---

### 3. Financial & Implementation Partners API

#### A. Find Nearest Partners
- **Endpoint**: `POST /api/v1/partners/nearest`
- **Description**: Finds certified partners within `maxDistance` radius (default 50km) sorted by ascending distance.

**Request Payload:**
```json
{
  "lat": 13.0827,
  "lng": 80.2707,
  "schemeId": "scheme-001",
  "maxDistance": 50
}
```

**Response Payload:**
```json
{
  "partners": [
    {
      "id": "partner-001",
      "name": "State Bank of India - MSME Development Branch",
      "type": "Public Sector Bank",
      "coordinates": {
        "lat": 13.0827,
        "lng": 80.2707
      },
      "schemes": ["scheme-001", "scheme-002", "scheme-003", "scheme-004", "scheme-005", "scheme-006"],
      "fundAvailable": true,
      "npaStatus": "low",
      "address": "No. 22, Rajaji Salai, George Town, Chennai, Tamil Nadu 600001",
      "phone": "+91-44-25300000",
      "distance": 0,
      "distanceText": "0.00 km"
    }
  ],
  "totalFound": 3,
  "withinRange": 3,
  "message": "Nearest eligible partners found successfully",
  "userLocation": {
    "lat": 13.0827,
    "lng": 80.2707
  }
}
```

#### B. List Partners
- **Endpoint**: `GET /api/v1/partners`
- **Query Parameters**: `page`, `limit`, `type`, `schemeId`, `fundAvailable`, `npaStatus`, `search`.

#### C. Get Partner by ID
- **Endpoint**: `GET /api/v1/partners/:id`

#### D. Register Partner
- **Endpoint**: `POST /api/v1/partners/register`

---

### 4. Agent Application Workflows

#### A. Submit Application
- **Endpoint**: `POST /api/v1/agent/submit`
- **Request Payload:**
```json
{
  "agentId": "agent-001",
  "userId": "user-001",
  "schemeId": "scheme-001",
  "applicationData": {
    "requestedAmount": 250000,
    "businessCategory": "Food Processing"
  }
}
```
- **Response Payload:**
```json
{
  "success": true,
  "applicationId": "APP-1724770000-5821",
  "message": "Application submitted successfully"
}
```

#### B. Get Agent Applications / Users
- **Endpoint**: `GET /api/v1/agent/users/:agentId`

---

### 5. Document Generation & Download

#### A. Generate Pre-filled Application PDF
- **Endpoint**: `POST /api/v1/documents/generate`
- **Request Payload:**
```json
{
  "applicationId": "APP-12345",
  "user": {
    "name": "Ramesh Kumar",
    "phone": "+91 9876543210",
    "address": "Vijayawada, Andhra Pradesh"
  },
  "scheme": {
    "id": "scheme-001",
    "name": "PMMY - Tarun"
  },
  "applicationData": {
    "Business Type": "Spice Processing Unit",
    "Investment Requirement": "₹5,00,000"
  }
}
```
- **Response:**
```json
{
  "success": true,
  "documentId": "DOC-1724770000-8432",
  "preview": {
    "applicantName": "Ramesh Kumar",
    "schemeName": "PMMY - Tarun",
    "applicationId": "APP-12345"
  },
  "message": "Application document generated successfully"
}
```

#### B. Download Information
- **Endpoint**: `GET /api/v1/documents/download/:docId`

#### C. Stream Generated PDF File
- **Endpoint**: `GET /api/v1/documents/file/:docId`
- **Content-Type**: `application/pdf`

---

### 6. User Authentication (Optional)

#### A. Register
- **Endpoint**: `POST /api/v1/users/register`
- **Payload**: `{ "name": "...", "email": "...", "password": "..." }`

#### B. Login
- **Endpoint**: `POST /api/v1/users/login`
- **Payload**: `{ "email": "...", "password": "..." }`

---

### 7. User Feedback

- **Endpoint**: `POST /api/v1/feedback`
- **Payload:**
```json
{
  "userId": "user-001",
  "schemeId": "scheme-001",
  "rating": 5,
  "comment": "Seamless application and rapid partner matching!"
}
```

---

## 🧪 Testing with cURL

```bash
# 1. Health Check
curl http://localhost:5000/api/health

# 2. Recommend Schemes
curl -X POST http://localhost:5000/api/v1/schemes/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "projectType": "food processing",
    "cost": 250000,
    "income": 300000,
    "education": "graduate",
    "location": "Andhra Pradesh"
  }'

# 3. Calculate EMI
curl -X POST http://localhost:5000/api/v1/calculator/emi \
  -H "Content-Type: application/json" \
  -d '{
    "principal": 250000,
    "annualRate": 6.5,
    "tenureMonths": 60,
    "moratoriumMonths": 6
  }'

# 4. Nearest Partners
curl -X POST http://localhost:5000/api/v1/partners/nearest \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 13.0827,
    "lng": 80.2707,
    "schemeId": "scheme-001",
    "maxDistance": 50
  }'

# 5. Agent Submit Application
curl -X POST http://localhost:5000/api/v1/agent/submit \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent-001",
    "userId": "user-001",
    "schemeId": "scheme-001",
    "applicationData": { "businessType": "Food Processing" }
  }'

# 6. Generate Document
curl -X POST http://localhost:5000/api/v1/documents/generate \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "APP-1001",
    "user": { "name": "Aarav Sharma", "phone": "+91 9876543210", "address": "Chennai, Tamil Nadu" },
    "scheme": { "id": "scheme-001", "name": "PMMY - Tarun" },
    "applicationData": { "Category": "Manufacturing", "LoanAmount": "500000" }
  }'
```

---

## 🛡️ License

Built for **Smart India Hackathon 2026**. Open source under the MIT License.
