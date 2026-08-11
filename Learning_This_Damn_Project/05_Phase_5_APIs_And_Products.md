# Phase 5: APIs and Products

Welcome to the heart of the backend! This phase covers how the application actually handles requests related to products, search, recommendations, and cart management. We'll be breaking down the APIs, RESTful principles, controllers, routes, and more.

## RESTful API Design Principles
Before diving into the code, let's understand how a REST API works. REST (Representational State Transfer) is a standard for designing APIs. Some key principles observed in our app:
1. **Resource-based URLs:** URLs identify things (e.g., `/api/products`), not actions.
2. **HTTP Methods:** We use verbs to define what to do with the resource.
   - `GET` to fetch data (e.g., `router.route("/").get(productController.getProducts)`)
   - `POST` to create data
   - `PATCH`/`PUT` to update data
   - `DELETE` to remove data
3. **Stateless:** Each request from client to server must contain all info needed to understand the request.

---

## 1. Product Routing (`productRouter.js`)

File: [`productRouter.js`](file:///Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend/router/productRouter.js)

The router is like the traffic cop of your application. It matches a URL and an HTTP method to a specific controller function.

```javascript
const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");
const authController = require("../controller/authController");
const Limiter = require("../utils/rateLimit");

// 1. PUBLIC ROUTES
// Rate limit: Max 400 requests per 5 minutes per IP.
router.use(Limiter(5 * 60 * 1000, 400));

// Specific routes must come BEFORE dynamic parameters!
router.route("/search").get(productController.searchProduct);
router.route("/:asin/:id").get(productController.getProduct);
router.route("/").get(productController.getProducts);

// 2. PROTECTED ROUTES
// The authController.protected middleware verifies the user's JWT token
router.use(authController.protected);
// Stricter rate limit for authenticated actions: Max 150 requests per 5 minutes.
router.use(Limiter(5 * 60 * 1000, 150));

router
  .route("/addToCart")
  .patch(authController.isActive, productController.addProductToCart);
```

**Key Takeaways:**
- **Route Order Matters:** Notice how `/search` is placed before `/:asin/:id`. If it were placed after, a request to `/search` would be mistaken for an `asin` of "search".
- **Rate Limiting:** We apply different rate limits for public vs. protected routes.

---

## 2. Product Controllers (`productController.js`)

File: [`productController.js`](file:///Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend/controller/productController.js)

The controller handles the business logic. Let's look at the major functions.

### A. Dynamic Home Page (`getProducts`)
Instead of fetching all products, this grabs 8 random items from each available category.
```javascript
exports.getProducts = catchAsync(async (req, res, next) => {
  // 1. Get unique categories
  const uniqueCategories = await products.distinct("categories.name");
  const homeProducts = {};

  // 2. Grab 8 random products per category
  for (const category of uniqueCategories) {
    const items = await products.aggregate([
      { $match: { categories: { $elemMatch: { name: category } } } },
      { $sample: { size: 8 } },
    ]);
    if (items.length > 0) homeProducts[category] = items;
  }
  
  sendResponse(res, 200, 'products loaded', homeProducts);
});
```

### B. Searching Products (`searchProduct`)
We use MongoDB's `$regex` for a flexible string search.
```javascript
exports.searchProduct = catchAsync(async (req, res, next) => {
  const query = req.query.q;
  const page = +req.query.page;
  
  // Searching Title OR Category Name using case-insensitive regex
  const searchedProduct = await products
    .find({ 
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { "categories.name": { $regex: query, $options: 'i' } }
      ] 
    })
    .limit(8)
    .skip((page - 1) * 8); // Pagination logic!
    
  // ...
});
```
> [!NOTE]
> **Why `$regex`?** It's quick and easy for substring matches.
> **Alternatives:** MongoDB `$text` search uses indexes for better performance on large datasets. Atlas Search (Lucene-based) offers fuzzy matching and typo tolerance, which is best for massive scale e-commerce.

### C. ML Recommendation Bridge (`getRecommendations`)
This function calculates similarity between products using **Cosine Similarity** based on their text (titles, descriptions, categories) to suggest items.
```javascript
// A simplified text-frequency cosine similarity score calculation
const targetFreq = getTermFrequency(targetString);
const compareFreq = getTermFrequency(compareString);
const score = calculateCosineSimilarity(targetFreq, compareFreq);
```

### D. Cart Operations
When adding to the cart, the backend pushes an object to the user's `products` array.
```javascript
await user.findOneAndUpdate(
  { _id: req.user.id },
  {
    $push: {
      products: {
        $each: [{ products: req.body.id, productPaid: false }],
        $position: 0,
      },
    },
  },
  { new: true }
);
```

---

## 3. User Routing and Controller

Files:
- [`userRouter.js`](file:///Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend/router/userRouter.js)
- [`userController.js`](file:///Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend/controller/userController.js)

The user controller handles profile details and cart ownership verification.

```javascript
// In userController.js - Updating User Details
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.Email || req.body.Name) {
    const updatedBody = filterObj(req.body); // only allow Name or Email updates
    const user = await users.findById(req.user.id).select("+active");
    user.set(updatedBody);
    await user.save({ validateModifiedOnly: true });
    // ...
  }
});
```

---

## 4. Rate Limiting

File: [`rateLimit.js`](file:///Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend/utils/rateLimit.js)

Rate limiting protects your app from DDoS attacks or brute force.
```javascript
const rateLimit = require("express-rate-limit");
function Limiter(ms, max) {
  return rateLimit({ windowMs: ms, max, standardHeaders: true, legacyHeaders: false });
}
```
We set different limits based on route exposure (e.g., 400 for public, 150 for protected routes).

## 5. Vercel Serverless Implications
Because this app is deployed on Vercel, it runs in a "Serverless" environment.
- Functions spin up, handle the request, and shut down.
- **Cold Starts:** The first request after a period of inactivity might be slow.
- **Statelessness:** You cannot store session data in memory (like a variable `let activeUsers = []`). Everything must go to the database (MongoDB).

---

## 🎧 Interview Prep

**Q: Explain how you designed your REST API.**
**A:** "I structured my API around core resources like `/products` and `/users`. I used standard HTTP methods—GET for fetching details, PATCH for updating carts, and POST for checkout. I also made sure to version or namespace the API properly and kept the routes semantic, separating public read routes from protected modification routes."

**Q: How did you implement pagination on the backend?**
**A:** "I used MongoDB's `limit` and `skip` methods. By taking a `page` number from the query string (e.g., `?page=2`), I apply `.limit(8)` to grab 8 items, and `.skip((page - 1) * 8)` to bypass the items on previous pages. It's efficient enough for our current scale."

**Q: Why use `$regex` for search instead of `$text` or Atlas Search?**
**A:** "I used `$regex` initially because it allowed for simple partial string matching on multiple fields (titles and categories) without complex index setups. However, I recognize its limitations regarding performance on large datasets. If I were to scale this, I would migrate to MongoDB Atlas Search for typo tolerance and faster inverted-index lookups."

**Q: Why are your rate limits different for public vs. protected routes?**
**A:** "Public routes like search and home page fetching are accessed frequently by unregistered users and web crawlers, so they need a higher tolerance (400 requests/5 min). Protected routes handle sensitive mutations like adding to cart or checking out, which a normal user wouldn't spam, so setting a lower limit (150 requests) helps prevent abuse and automated attacks on user accounts."
