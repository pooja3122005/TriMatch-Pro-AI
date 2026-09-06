# TriMatch Pro AI

**Enterprise Clinical Trial Matching, AI Protocol Parsing & Patient Enrollment Platform**

Matches patients to clinical research studies by decomposing complex trial eligibility criteria into deterministic, mathematical rules and evaluating them against patient electronic health records (EHR) and laboratory datasets with 100% verifiable source data citations.

---

## 📁 Professional Repository Architecture

```
TriMatch-Pro-AI/
├── backend/                       # Python FastAPI Backend Architecture
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                # FastAPI app, CORS middleware & router mounts
│   │   ├── core/                  # Core configurations & logging
│   │   │   ├── config.py
│   │   │   └── logging.py
│   │   ├── db/                    # Supabase client with retry transport
│   │   │   └── client.py
│   │   ├── models/                # Pydantic validation schemas
│   │   │   └── schemas.py
│   │   ├── routers/               # Clean modular API routers
│   │   │   ├── audit.py           # /audit-log, /flagged-for-review
│   │   │   ├── enrollment.py      # /trials/{id}/patients/{id}/(invite|consent|enroll|withdraw)
│   │   │   ├── matching.py        # /trials/{id}/db-candidates, /match, /lab-results/{id}
│   │   │   ├── patients.py        # /patients/*, /upload-lab, /upload-document
│   │   │   ├── progress.py        # /trials/{id}/progress, compute-metrics
│   │   │   └── trials.py          # /trials/{id}, /import, /parse-criteria, /upload-document
│   │   └── services/              # Domain business logic & external integrations
│   │       ├── audit_service.py
│   │       ├── coarse_filter_service.py
│   │       ├── db_matching_service.py
│   │       ├── document_upload_service.py
│   │       ├── enrollment_service.py
│   │       ├── lab_upload_service.py
│   │       ├── llm_service.py     # Google Gemini AI extraction & parsing
│   │       ├── matching_service.py
│   │       ├── patient_service.py
│   │       ├── patient_signup_service.py
│   │       ├── progress_service.py
│   │       ├── trial_service.py   # ClinicalTrials.gov API client
│   │       └── trial_upload_service.py
│   ├── data/                      # Synthetic demo datasets (patients.json)
│   ├── migrations/                # Supabase PostgreSQL schema migrations
│   ├── scripts/                   # Database seeding and migration utilities
│   ├── .env.example               # Backend environment template
│   ├── requirements.txt           # Python dependencies
│   └── run.py                     # Convenience backend runner
│
├── frontend/                      # Modern React JS Frontend (Vite + Vanilla CSS)
│   ├── public/                    # Static public assets & icons
│   ├── src/
│   │   ├── api/                   # Unified API client service layer
│   │   │   └── client.js
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Header.jsx         # Global nav with theme toggle & active badge
│   │   │   ├── Footer.jsx
│   │   │   ├── Modal.jsx          # Accessible dialog modals
│   │   │   └── CandidateDrawer.jsx# Drill-down evaluation & Source Data Verification (SDV)
│   │   ├── context/               # Global state contexts
│   │   │   ├── AuthContext.jsx    # Session role management (Researcher/Patient)
│   │   │   └── ToastContext.jsx   # Animated notification toasts
│   │   ├── pages/                 # Full feature portal views
│   │   │   ├── LandingPage.jsx    # Hero, quick study launcher with presets
│   │   │   ├── ResearcherPortal.jsx # Protocol parser, 1000-patient matcher, audit stream
│   │   │   ├── PatientPortal.jsx  # Participant dashboard & active study timeline
│   │   │   ├── ConsentWorkflow.jsx# 4-step guided informed consent wizard
│   │   │   ├── LabUploadPage.jsx  # Unstructured lab text & PDF/photo AI parser
│   │   │   ├── DocumentUploadPage.jsx # Medical record & imaging scan vault
│   │   │   ├── PatientAuth.jsx    # Self-registration intake & sign-in
│   │   │   └── SandboxDemo.jsx    # Phase 1 in-memory sandbox tester
│   │   ├── App.jsx                # Main application coordinator & routing
│   │   ├── index.css              # Custom Vanilla CSS design system
│   │   └── main.jsx               # React DOM entry point
│   ├── index.html                 # HTML shell with Google Fonts
│   ├── package.json               # Frontend dependencies & build scripts
│   └── vite.config.js             # Vite configuration with API proxy
│
├── package.json                   # Root monorepo script runner
├── main.py                        # Root FastAPI server proxy
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js v18+ & npm**
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/apikey))
- **Supabase Project** (Database URL + Anon Key)

---

### 1. Backend Setup

```powershell
# Create & activate virtual environment
py -m venv venv
.\venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r backend/requirements.txt

# Configure environment variables
copy backend\.env.example backend\.env
```

Ensure `backend/.env` contains your `GEMINI_API_KEY`, `DATABASE_URL`, and `SUPABASE_ANON_KEY`.

---

### 2. Frontend Setup

```powershell
cd frontend
npm install
npm run build
cd ..
```

---

### 3. Running the Application

#### Option A: Production Mode (FastAPI serves built React SPA)
```powershell
# From project root:
uvicorn main:app --reload

# Or directly from backend folder:
cd backend
python run.py
```
Open **`http://127.0.0.1:8000/`** in your browser.

#### Option B: Full-Stack Development Mode (Vite Hot-Reload + FastAPI)
```powershell
# Terminal 1 - Backend API:
uvicorn main:app --reload

# Terminal 2 - React Frontend (Vite with API proxy):
npm run dev
```
Open **`http://localhost:5173/`** with instant Hot-Module Replacement.

---

## 🔬 Core Capabilities & Portals

1. **Researcher Hub (`#researcher`)**:
   - Fetch live studies from ClinicalTrials.gov (e.g. `NCT04280705`, `NCT04843709`, `NCT04551755`) or upload custom protocol documents.
   - Decompose unstructured text into structured criteria with Google Gemini AI.
   - Match candidate cohorts (10 to 1,000 patients) with real-time pass/fail/unknown breakdowns.
   - Candidate inspection drawer with **Source Data Verification (SDV)** citing exact database lab records.
   - Recruitment state machine (Invite $\rightarrow$ Consent $\rightarrow$ Enroll $\rightarrow$ Withdraw) and live immutable 21 CFR Part 11 audit log stream.
   - Baseline-to-latest lab trajectory delta comparison and success rate metrics.

2. **Patient & Participant Portal (`#patient-portal`)**:
   - Participant dashboard with active study invitations and status tracking.
   - 4-step guided **Informed Consent Workflow (`#consent`)** with plain-language terms, risk/benefit disclosures, digital electronic signatures, and personal recovery milestones.
   - **AI Lab Report Ingestion (`#upload-lab`)**: Paste unstructured EHR lab reports or upload diagnostic PDFs/photos for instant automated structured extraction into `lab_results`.
   - **Supporting Records Vault (`#upload-doc`)**: Medical reports, imaging scans, and referral document filing.
   - **Phase 1 Sandbox (`#sandbox`)**: In-memory test harness evaluating 5 synthetic patients without database dependencies.

---

## 📜 Compliance & Architecture Principles

- **Deterministic Evaluation**: AI is used strictly for extraction and semantic parsing; patient qualification is evaluated through deterministic mathematical and boolean comparison rules.
- **Source Data Traceability**: Every evaluation links directly to the cited `lab_results` or diagnosis record.
- **21 CFR Part 11 Audit Trail**: Immutable state transition logging records actor attribution, timestamps, and transition metadata.
