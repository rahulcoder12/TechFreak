# Phase 2: Express.js Backend Core

Welcome to Phase 2! Let's dive into the core of the TechFreak backend. 
The backend lives at: `[Ecommerce-backend](file:///Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend)`

---

## 1. Why Express.js?

**Express.js** is the most popular web framework for Node.js. 
*   **Why we chose it:** It is minimal, unopinionated, and has a massive ecosystem. It's incredibly easy to build REST APIs quickly.
*   **Vs. Alternatives:** 
    *   *NestJS:* Highly opinionated, uses TypeScript and Angular-like structure (Great for huge enterprise apps, but overkill for us).
    *   *Fastify:* Extremely fast, but slightly steeper learning curve and smaller ecosystem than Express.
    *   *Koa:* Built by the Express team, uses modern async/await beautifully, but has a smaller plugin ecosystem.

---

## 2. MVC Architecture Explained

This project uses the **Model-View-Controller (MVC)** architectural pattern. 

*   **Model (`/model`):** Defines the data structure (Database Schemas). *e.g., How should a "User" look in MongoDB?*
*   **View:** In this project, our "View" is technically the separate React Frontend. The backend just sends JSON data.
*   **Controller (`/controller`):** The brains of the operation. Contains the logic for what happens when a route is hit. *e.g., Code to actually save the User to the database.*
*   **Router (`/router`):** The traffic cop. Directs incoming URLs to the correct Controller.

**Why use MVC?** Separation of concerns. If your route definitions, database schemas, and business logic were all in one `app.js` file, it would be thousands of lines long and impossible to debug.

---

## 3. The `app.js` Entry Point (Line-by-Line)

Let's look at `app.js` (simplified slightly for teaching). This file is the foundation of our entire API.

```javascript
// 1. Load environment variables from our .env file into process.env
require('dotenv').config({ path: __dirname + '/.env' }); 

// 2. Import Express and create our main app instance
const express = require('express');
const app = express();

// 3. Import Middlewares (We'll explain these below!)
const cors = require('cors');
const mongoose = require('mongoose');
const { xss } = require('express-xss-sanitizer');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const compression = require('compression');

// 4. Import our custom Routers & Error Handler
const userRouter = require('./router/userRouter');
const productRouter = require('./router/productRouter');
const errorHandler = require('./controller/errorController');

// 5. Connect to MongoDB using an IIFE (Immediately Invoked Function Expression)
(async function () {
  try {
    await mongoose.connect(process.env.VITE_DATABASE_URI);
    console.log('✅ database connected');
  } catch (err) {
    console.log('❌ DATABASE CONNECTION ERROR:', err);
  }
})();
```

### The Middleware Chain

Middleware are functions that intercept the request *before* it gets to your controllers.

```javascript
// TRUST PROXY: Needed if you are behind a load balancer (like Heroku or Vercel)
app.set('trust proxy', 1);

// SECURITY MIDDLEWARES
app.use(xss());              // Prevents Cross-Site Scripting (XSS) by stripping HTML tags from user inputs.
app.use(mongoSanitize());    // Prevents NoSQL Injection. Removes $ signs from user inputs so hackers can't manipulate DB queries.
app.use(helmet());           // Sets essential HTTP security headers to protect against common web vulnerabilities.

// OPTIMIZATION
app.use(compression());      // Compresses JSON responses (like GZIP) to make API calls faster.

// CORS (Cross-Origin Resource Sharing)
// Browsers block requests from different domains by default for safety.
// This allows our React frontend (running on a different port/domain) to talk to this API.
app.use(
  cors({
    credentials: true, // Allow cookies to be sent cross-origin (needed for JWT auth)
    origin: process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : 'https://bytecart.eloho.dev',
    methods: ['GET', 'POST', 'DELETE', 'PATCH'],
  })
);

// PARSERS
app.use(cookieParser());                           // Allows Express to read cookies attached to incoming requests.
app.use(express.json({ limit: '10kb' }));          // Parses incoming JSON payloads (req.body). Limits to 10kb to prevent denial-of-service attacks.
app.use(express.urlencoded({ extended: true }));   // Parses incoming form data.

// ROUTING
// If URL starts with /api/v1/users, pass it to the userRouter
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);

// GLOBAL ERROR HANDLING 
// (Must be the LAST middleware!)
app.use(errorHandler);

// START THE SERVER
app.listen(process.env.PORT || 3000, () => console.log('server started'));
```

*(Note: Rate limiting isn't explicitly active in this `app.js`, but it's often used via `express-rate-limit` to prevent brute force attacks).*

---

## 4. The Global Error Handler (`errorController.js`)

In Express, if you pass an argument to `next()` like this: `next(new Error("broken"))`, Express skips all other middlewares and goes straight to the Global Error Handler.

Here is a look at how we format errors in `[errorController.js](file:///Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend/controller/errorController.js)`:

```javascript
function errorController(err, req, res, next) {
  // We check if we are in development or production.
  // In development, we want the FULL stack trace to debug.
  // In production, we ONLY want to send clean, safe messages to the user (no code leaks).
  function otherErrors(error) {
    if (process.env.NODE_ENV === 'development') return devErrors(res, error);
    else return prodErrors(res, error);
  }

  // We catch specific MongoDB/Mongoose errors and format them nicely!
  if (err.code === 11000) return handleDuplicateErr(err); // e.g. Email already exists
  if (err.name === 'TokenExpiredError') return handleTokenExpiredError(err); // JWT Expired
  if (err.name === 'ValidationError') return handleValidationError(err); // Mongoose schema validation failed
  
  return otherErrors(err);
}
```

---

## 5. The `catchAsync` Utility Pattern

Handling `try/catch` blocks in every single controller gets messy. We use a wrapper function called `catchAsync`.

`[utils/catchAsync.js](file:///Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend/utils/catchAsync.js)`
```javascript
const createError = require("http-errors");

module.exports = (fn) => {
  return (req, res, next) => {
    // If the async function resolves, great!
    // If it rejects (throws an error), catch it and pass it to next(), which triggers the Global Error Handler.
    fn(req, res, next).catch((err) => next(createError(500, err)));
  };
};
```
**Usage in a controller:**
```javascript
// No messy try/catch needed!
exports.createUser = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    res.status(201).json({ data: newUser });
});
```

---

## 6. Interview Prep (Q&A)

**Q: What is the purpose of `express.json()` middleware?**
*Answer:* It parses incoming HTTP requests that have a JSON body (like when sending form data from React via `fetch` or `axios`). It takes the stringified JSON and converts it into a JavaScript object attached to `req.body`. Without it, `req.body` would be undefined.

**Q: Explain the MVC architecture and its benefits.**
*Answer:* MVC stands for Model-View-Controller. Models handle data and database logic. Views handle the user interface. Controllers act as the middleman, processing incoming requests, interacting with Models, and sending responses back to the View. The primary benefit is the separation of concerns, making the codebase scalable, easier to test, and allowing multiple developers to work on different parts simultaneously.

**Q: How does Express handle asynchronous errors?**
*Answer:* By default, unhandled promise rejections in async route handlers will crash an Express app (or just hang the request in Express 4). We handle this by using a wrapper function (often called `catchAsync`) that executes the async function, catches any errors, and forwards them to Express's global error-handling middleware using the `next(err)` function.

**Q: What is CORS and why did you configure it?**
*Answer:* Cross-Origin Resource Sharing (CORS) is a browser security feature that restricts web pages from making requests to a different domain than the one that served the web page. Because our React frontend runs on port 5173 and our Express backend runs on port 3000, they are considered different origins. We configured the `cors()` middleware to explicitly allow requests from our frontend's origin.
