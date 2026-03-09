# ☁️ CloudVault

> Your private & serverless cloud drive  **[cloudvault-utkarsh.vercel.app](https://cloudvault-utkarsh.vercel.app/)**

CloudVault is a full-stack personal cloud storage application inspired by Google Drive. Built entirely on AWS Free Tier services, it lets you securely upload, search, rename, and delete files with every file strictly private to your account.

---

## ✨ What Makes It Different

- **Zero server management** — fully serverless, scales automatically, costs nothing at personal usage volumes
- **Direct-to-S3 uploads** — files go straight from your browser to S3 via presigned URLs, no Lambda bandwidth costs
- **True user isolation** — every file is scoped to your Cognito identity at the storage level, not just the application layer
- **Any file type** — upload documents, images, videos, archives, and more, with inline preview for media files
- **Clean, fast UI** — dark-themed React SPA with drag-and-drop upload, instant search, and card-based file grid

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18 + Vite** | component-based UI, fast dev server, optimized production builds |
| **AWS Cognito** | User authentication including signup, email verification, JWT token issuance and validation |
| **AWS API Gateway** | REST API layer which routes HTTP requests to Lambda, enforces Cognito JWT auth on protected routes |
| **AWS Lambda (Node.js 20)** | Backend logic with serverless functions for each operation (upload, list, search, rename, delete) |
| **AWS S3** | File storage A private bucket with user-prefixed keys (`users/{sub}/files/`) for strict isolation |
| **AWS DynamoDB** | File metadata — single-table design with fast sorted queries by upload time |
| **Presigned URLs** | Secure direct browser↔S3 transfers — short-lived signed URLs for upload (15 min) and download/preview (1 hr) |
| **Vercel** | Frontend hosting Service which automatically deploys from GitHub |

---

## 📁 Folder Structure

```
cloudvault/
├── frontend/                   # React SPA
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx           # Sign-in form
│   │   │   ├── Signup.jsx          # Registration + email verification
│   │   │   ├── Dashboard.jsx       # Main file manager (upload, search, grid)
│   │   │   ├── FileCard.jsx        # Individual file card with actions
│   │   │   ├── RenameModal.jsx     # Rename dialog
│   │   │   ├── DeleteModal.jsx     # Delete confirmation dialog
│   │   │   └── PreviewModal.jsx    # Inline image/video preview
│   │   ├── hooks/
│   │   │   ├── useAuth.jsx         # Auth context — login, logout, token storage
│   │   │   └── useToast.jsx        # Toast notification system
│   │   ├── utils/
│   │   │   ├── api.js              # Fetch wrapper — auto-injects Bearer token
│   │   │   └── fileUtils.js        # Helpers — format bytes, dates, file icons
│   │   ├── styles/
│   │   │   └── global.css          # Dark theme, all styles
│   │   ├── App.jsx                 # Root component, auth-based routing
│   │   └── main.jsx                # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/                    # AWS Lambda handlers (one file per route)
    └── handlers/
        ├── signup.js               # POST /signup
        ├── confirmSignup.js        # POST /confirm-signup
        ├── login.js                # POST /login
        ├── getUploadUrl.js         # POST /get-upload-url
        ├── addMetadata.js          # POST /add-metadata
        ├── listFiles.js            # GET  /list-files
        ├── searchFiles.js          # GET  /search-files
        ├── getDownloadUrl.js       # POST /get-download-url
        ├── renameFile.js           # PUT  /rename-file
        └── deleteFile.js           # DELETE /delete-file
```

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js 18+
- AWS account with all backend resources deployed (Cognito, Lambda, API Gateway, S3, DynamoDB)

### 1. Clone the repo

```bash
git clone https://github.com/utkarshh7/cloudvault.git
cd cloudvault
```

### 2. Set up environment variables

Inside the `frontend/` folder, create a `.env` file:

```bash
cd frontend
cp .env
```

Open `.env` and fill in your API Gateway URL:

```
VITE_API_BASE_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the dev server

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

### 5. Create an account

- Click **Create account**, enter your email and a password (min 8 characters)
- Check your inbox for a 6-digit verification code
- Enter the code to verify and you'll be logged in automatically

---

## 🌐 Live Demo

Hosted on Vercel: **[cloudvault-utkarsh.vercel.app](https://cloudvault-utkarsh.vercel.app/)**

---
