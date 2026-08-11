# Phase 1: TechFreak Setup & Architecture Guide

Welcome to the TechFreak project! This document will walk you through setting up the entire project from scratch, explaining *why* we do each step so you aren't just blindly copying and pasting commands.

---

## 1. Prerequisites (What you need installed)

Before writing any code, your computer needs the right tools to run the different parts of our stack:

*   **[Node.js](https://nodejs.org/en/) & npm:** Our frontend (React/Vite) and backend (Express) both run on JavaScript. Node.js is the engine that runs JS outside the browser, and `npm` is the package manager used to download dependencies.
*   **[Python 3](https://www.python.org/):** Used specifically for our Machine Learning (ML) recommendation service. Python excels at data science and math tasks.
*   **[MongoDB](https://www.mongodb.com/):** Our NoSQL database where we store users and products. You don't necessarily need it installed locally if you use MongoDB Atlas (the cloud version), which this project does.

---

## 2. Project Architecture (How the 3 services connect)

TechFreak is split into a **Microservice-like Architecture**:

1.  **Frontend (`E-Commerce-FrontEnd`):** Built with React + Vite. It runs on `http://localhost:5173`. It talks ONLY to the backend via HTTP requests.
2.  **Backend (`Ecommerce-backend`):** Built with Express.js. It runs on `http://localhost:3000`. It connects to MongoDB to save/fetch data, and it also communicates with the ML service when it needs a product recommendation.
3.  **ML Engine (`tech-freak-ml`):** Built with Python + FastAPI. It runs on `http://127.0.0.1:8000`. It is a "stateless" API. The backend sends it a list of products, and the ML engine returns the best matches using Cosine Similarity.

**The Flow:** User clicks a product -> Frontend asks Backend for data -> Backend asks ML Engine for recommendations -> Backend formats data and sends it back to Frontend -> User sees UI update.

---

## 3. Cloning & Setup Instructions

Assuming you have cloned the main repository, you need to set up each folder independently.

### A. The Frontend
```bash
cd E-Commerce-FrontEnd
npm install
npm run dev
```

### B. The Backend
```bash
cd Ecommerce-backend
npm install
npm start
```

### C. The ML Engine
Python uses "virtual environments" to keep dependencies scoped to this project (similar to how `node_modules` works for JS).
```bash
cd tech-freak-ml
# Create virtual environment
python3 -m venv venv
# Activate it (Mac/Linux)
source venv/bin/activate
# Install dependencies (assuming you have a requirements.txt, or install fastapi uvicorn pandas scikit-learn)
pip install fastapi uvicorn pandas scikit-learn pydantic
# Run the server
uvicorn main:app --reload
```

---

## 4. Environment Variables Explained

Environment variables (`.env` files) store secrets (like database passwords) and environment-specific configs (like local vs production URLs). **Never commit these to GitHub.**

### Frontend `.env` (Location: `/Users/rahulbhuiya/Desktop/TechFreak/E-Commerce-FrontEnd/.env`)
```env
# Tells the frontend where to send API requests
VITE_BACKEND_URL=http://localhost:3000/api/v1

# Public key for Stripe payments (safe to expose to frontend)
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### Backend `.env` (Location: `/Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend/.env`)
```env
# Connection string to MongoDB Atlas. Contains username and password!
VITE_DATABASE_URI=mongodb+srv://...

# Secret key used to sign and verify JSON Web Tokens (User Authentication)
JWT_SECRET=any_long_random_string_here

# Secret for encrypting specific data (if applicable)
CRYPT_SECRET=your_random_secret_password

# Tells Express we are running locally so it gives us detailed error messages
NODE_ENV=development

# Email configs for sending receipts/password resets via NodeMailer
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=rahulbhuiya2004@gmail.com
EMAIL_PASSWORD=gqbneesbmfmcdgdo 

# Secret Stripe key to process payments (NEVER expose this to frontend)
STRIPE_KEY=sk_test_...
```

---

## 5. Common Setup Errors & Fixes

*   **Error:** `EADDRINUSE: address already in use :::3000`
    *   **Why:** You already have a backend running, or another app is using port 3000.
    *   **Fix:** Kill the terminal process running it, or change the port.
*   **Error:** `MongoServerSelectionError: connection <monitor> to xx.mongodb.net:27017 closed`
    *   **Why:** Your IP address is not whitelisted on MongoDB Atlas.
    *   **Fix:** Go to MongoDB Atlas -> Network Access -> Add IP Address -> Allow Access From Anywhere (or your current IP).
*   **Error:** `ModuleNotFoundError: No module named 'fastapi'` in Python
    *   **Why:** You forgot to activate your virtual environment before running the ML server.
    *   **Fix:** Run `source venv/bin/activate` then try again.

---

## 6. Vercel Deployment Configuration

In the backend folder, you'll notice a `vercel.json` file:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.js"
    }
  ]
}
```

**What this does:**
Vercel is traditionally for frontend hosting, but we can deploy our Express backend there using Serverless Functions. 
- The `builds` section tells Vercel: "Treat `app.js` as a Node.js serverless function."
- The `routes` section tells Vercel: "Take EVERY single incoming HTTP request (`/(.*)`) and route it directly to `app.js`." This allows Express to handle the routing internally instead of Vercel trying to find individual files for each route.
