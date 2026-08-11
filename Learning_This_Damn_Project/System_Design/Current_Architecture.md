# TechFreak: Current System Architecture

Welcome to the architectural breakdown of **TechFreak**, a full-stack e-commerce platform. This document explains how the current pieces fit together.

## 🏗 Technology Stack

- **Frontend**: React 18, Vite (for fast builds), SWR (for data fetching), React Router v6, Stripe (checkout), Formik/Yup (form validation), Sass (styling).
- **Backend**: Node.js with Express.js, MongoDB via Mongoose, JWT (JSON Web Tokens) in httpOnly cookies, bcryptjs (password hashing), Stripe SDK, Nodemailer, Puppeteer (web scraping), Security middleware (Helmet, XSS protection, Rate limiting). Follows MVC (Model-View-Controller) pattern.
- **ML Service**: Python, FastAPI, Pandas, Scikit-Learn (using TF-IDF + Cosine Similarity). This acts as a stateless recommendation engine.
- **Deployment**: Vercel (both frontend and serverless backend functions).

---

## 🧩 Component Diagram

Here is a high-level view of how the system components interact:

```mermaid
graph TD
    User[User / Browser] -->|HTTP/HTTPS| FE[React Frontend - Vercel]
    FE -->|REST API calls| BE[Express Backend API]
    FE -->|Checkout| Stripe[Stripe Gateway]
    BE -->|Read/Write| DB[(MongoDB)]
    BE -->|REST/HTTP| ML[FastAPI ML Service]
    BE -->|Send Emails| SMTP[Email Service]
    BE -->|Scrape Data| Ext[External Websites]
    BE -->|Webhooks/API| StripeAPI[Stripe API]
```

---

## 🔀 Communication Patterns
- **Frontend ↔ Backend**: RESTful HTTP API calls using JSON payloads. SWR is used on the frontend to manage caching, revalidation, and state for these requests.
- **Backend ↔ ML Service**: Synchronous REST HTTP calls over the internal network or public internet, depending on deployment.
- **Authentication**: JWTs are issued by the backend upon login and stored in HTTP-only cookies on the client side to prevent XSS attacks.

---

## 🗄 Database Schema Relationships

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ REVIEW : writes
    PRODUCT ||--o{ REVIEW : has
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : "is part of"

    USER {
        ObjectId _id
        String name
        String email
        String password
        String role
    }
    PRODUCT {
        ObjectId _id
        String name
        Number price
        String description
        String category
    }
    ORDER {
        ObjectId _id
        ObjectId user_id
        Number totalPrice
        String status
        String paymentStatus
    }
```

---

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client (React)
    participant B as Backend (Express)
    participant DB as MongoDB

    C->>B: POST /api/auth/login (email, password)
    B->>DB: Find user by email
    DB-->>B: User document
    B->>B: Verify password (bcrypt)
    B->>B: Generate JWT
    B-->>C: Response with HTTP-only cookie containing JWT
    Note over C,B: Subsequent requests
    C->>B: GET /api/user/profile (Cookie attached automatically)
    B->>B: Verify JWT
    B-->>C: User Profile Data
```

---

## 💳 Payment Flow

```mermaid
sequenceDiagram
    participant C as Client (React)
    participant B as Backend (Express)
    participant S as Stripe

    C->>B: POST /api/orders (cart items)
    B->>B: Calculate total, create Order in DB (status: pending)
    B->>S: Create Payment Intent
    S-->>B: client_secret
    B-->>C: return client_secret
    C->>S: Confirm payment (Card details + client_secret)
    S-->>C: Payment success/fail
    S-->>B: Webhook: payment_intent.succeeded
    B->>B: Update Order status to paid
```

---

## 🚀 Deployment Architecture
Currently, TechFreak is deployed on **Vercel**. 
- The React frontend is served statically via Vercel's Edge Network.
- The Express backend is hosted as Serverless Functions on Vercel. 
- *Note*: Hosting Express on Vercel as serverless functions can sometimes lead to cold start issues and limits on execution time, especially for background tasks like Nodemailer and Puppeteer.
