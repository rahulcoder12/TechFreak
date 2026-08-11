# TechFreak Interview Preparation: Architecture & Design

This document covers system architecture, high-level design decisions, scalability, and infrastructure for the TechFreak project. Use these to prepare for system design and senior-level interview discussions.

## System Design & Architecture (10 Questions)

**1. Can you draw or describe the high-level architecture of TechFreak?**
*Model Answer:* "It’s a decoupled client-server architecture. The client is a React Single Page Application (SPA) hosted on Vercel's Edge CDN. It communicates via REST API to an Express.js backend, also deployed as serverless functions on Vercel. The backend reads/writes to a managed MongoDB Atlas cluster. For heavy compute (recommendations), the Node backend delegates to a separate Python/FastAPI microservice. External services include Stripe for payments and an SMTP server via Nodemailer for emails."

**2. Why did you choose a monolithic backend for the main API rather than microservices?**
*Model Answer:* "For the core e-commerce features—users, products, carts, orders—a monolith makes sense. Microservices introduce complex network latency, data consistency issues, and deployment overhead. Since a single small team (just me) built this, a monolith in Express allowed for rapid iteration. The only piece I extracted to a microservice was the ML engine, because it required a completely different tech stack (Python/Pandas)."

**3. What is the difference between your React Frontend and your Express Backend? Why not use Next.js?**
*Model Answer:* "My setup relies on Client-Side Rendering (CSR). The browser downloads an empty HTML file and a bundle of JS, and React renders the UI in the browser. Next.js offers Server-Side Rendering (SSR), which is better for SEO because the HTML is fully formed when it hits the browser. If I were rebuilding this specifically for maximizing Google search rankings for products, Next.js would be the better architectural choice."

**4. Describe the data flow when a user purchases an item.**
*Model Answer:* 
1. User clicks 'Checkout' in React.
2. React asks Express for a Stripe Client Secret.
3. Express creates a PaymentIntent with Stripe and returns the secret.
4. React securely sends card info directly to Stripe using the secret.
5. Stripe processes it and triggers a Webhook to Express.
6. Express verifies the Webhook, creates the Order in MongoDB, reduces product stock, and triggers Nodemailer.
7. React detects the success, clears the local cart state, and redirects to a success page.

**5. How would you design a caching layer for this architecture?**
*Model Answer:* "I would place a Redis cluster between the Express API and MongoDB. Read-heavy endpoints, like `/api/products` (the homepage catalog), would check Redis first. If missing, it queries MongoDB and saves the result to Redis with an expiration time. Cache invalidation is the hardest part: I would clear specific Redis keys inside the admin controllers whenever a product is updated or deleted."

**6. If your Python ML service goes down, how does it affect the system?**
*Model Answer:* "I designed it to fail gracefully. If the Express API calls the FastAPI service and it times out or returns a 500, the Express controller catches the error. Instead of crashing the page, it just returns a generic list of 'Top Selling' products to the frontend as a fallback. The user still sees recommendations, just not personalized ones."

**7. Why use Vercel Serverless Functions instead of a traditional EC2 server or Heroku?**
*Model Answer:* "Serverless abstracts away infrastructure management. I don't have to patch OS updates or configure Nginx. Also, it auto-scales instantly. If traffic spikes, Vercel spins up more function instances. The downside is cold starts and lack of persistent background processes, which is why cron jobs or long-running tasks require external triggers."

**8. What are the bottlenecks in your current architecture?**
*Model Answer:* "The biggest bottleneck is the database. Since everything writes to a single MongoDB replica set, write-heavy events (like a flash sale) could overwhelm it. The other bottleneck is the serverless connection pool limits to MongoDB. Finally, search is currently basic DB queries; moving to Elasticsearch would vastly improve search speed and relevance."

**9. How do you manage secrets and configuration across these different services?**
*Model Answer:* "Environment variables. On Vercel, I define them in the project settings UI. I ensure that Stripe Secret Keys, DB URIs, and JWT Secrets never touch the frontend. Only public keys (like Stripe Publishable Key) are exposed to the React build using the `VITE_` prefix."

**10. How would you handle a flash sale where traffic spikes 100x for 10 minutes?**
*Model Answer:* "The frontend on Vercel CDN will easily handle the static asset load. The Serverless backend will auto-scale, but might overwhelm MongoDB connections. I would: 1. heavily cache read requests in Redis, 2. queue checkout requests using a message broker like RabbitMQ or AWS SQS to process orders sequentially without crashing the DB, and 3. over-provision the MongoDB cluster temporarily."

---

## Database Design (10 Questions)

**11. Walk me through the schema design for a 'Product'.**
*Model Answer:* "The Product schema includes basic fields: `name`, `description`, `price`, and `category`. It also has an array of `images` (URLs). For inventory, a `countInStock` integer. To handle reviews, I embedded a `reviews` array containing sub-documents with `user_id`, `rating`, and `comment`. It also stores pre-calculated `averageRating` and `numReviews` so I don't have to calculate them dynamically on every read."

**12. Why embed Reviews inside the Product document instead of referencing them?**
*Model Answer:* "In MongoDB, data that is accessed together should be stored together. When a user views a product, they almost always want to see the reviews. Embedding them avoids a secondary lookup query. The trade-off is the 16MB document limit in Mongo, but a product realistically won't hit that limit just with text reviews. If a product gets 10,000 reviews, I would have to refactor to a referenced schema."

**13. How are Orders linked to Users and Products?**
*Model Answer:* "The Order document contains a `user` field, which is an ObjectId referencing the User collection. It also contains an `orderItems` array. Inside this array, I store the Product ObjectId, but I *also* hardcode the `name`, `price`, and `image` at the time of purchase. This is crucial: if a product price changes a month later, the historical order receipt must reflect the original purchase price, not a dynamic reference."

**14. What indexing strategies did you use?**
*Model Answer:* "I indexed the `email` field in the User collection with `unique: true` to optimize login lookups and prevent duplicates. For Products, I created indexes on `category` and `price` because users frequently filter and sort by those. I also added a text index on `name` and `description` to allow for basic search functionality."

**15. How do you handle database transactions, for example, creating an order and reducing inventory simultaneously?**
*Model Answer:* "MongoDB supports multi-document ACID transactions. I would start a Mongoose session, begin the transaction, save the Order, decrement the Product stock, and if anything fails, abort the transaction so it rolls back. This ensures we don't accidentally take money without reserving the stock."

**16. What is the N+1 query problem, and does it affect your MongoDB setup?**
*Model Answer:* "The N+1 problem happens when you query a list of items (1 query), and then loop through them to make a separate query for their relationships (N queries). In Mongoose, this happens if you loop and call `.populate()` individually. To avoid it, I use a single `.populate()` on the initial query, which Mongoose optimizes into an `$in` query under the hood."

**17. Why use an ODM like Mongoose instead of the native MongoDB driver?**
*Model Answer:* "Mongoose provides schemas, type casting, validation, and lifecycle hooks (middleware). With native Mongo, I could accidentally insert a string into a number field or misspell a property. Mongoose prevents that at the app level. It also handles pre-save hooks, which I use to automatically hash the user's password before it hits the DB."

**18. How would you design a Shopping Cart database schema?**
*Model Answer:* "Actually, in my current architecture, the active cart is stored in the client-side state (React Context/Local Storage). It only hits the database when converted to an Order. If I wanted persistent carts across devices, I'd create a `Cart` collection linked to the `User_id`, containing an array of `Product_ids` and quantities, and update it via API calls on every add/remove."

**19. What happens if two users buy the last item in stock at the exact same millisecond?**
*Model Answer:* "This is a race condition. To solve this in MongoDB, I use optimistic concurrency control or atomic updates. Instead of fetching the stock, subtracting in Node, and saving, I send an atomic `$inc: { countInStock: -1 }` query combined with a filter `{ countInStock: { $gt: 0 } }`. If the query modifies 0 documents, it means someone else bought it first, and I return an 'Out of Stock' error."

**20. Explain the concept of aggregation pipelines in MongoDB.**
*Model Answer:* "Aggregations are advanced queries used for data processing. They work like an assembly line. For an admin dashboard, I could use an aggregation to calculate total revenue per month. The pipeline would start with `$match` (paid orders), then `$unwind` (split order items), then `$group` by month and sum the totals, and finally `$sort` by date."

---

## API & Security Design (10+ Questions)

**21. How did you design your REST API URIs?**
*Model Answer:* "I followed standard REST conventions. Nouns, not verbs. For example, `GET /api/products` gets all products. `POST /api/products` creates one. `GET /api/products/:id` gets a specific one. For nested resources, like reviews belonging to a product, I'd use `POST /api/products/:id/reviews`. It keeps the API predictable."

**22. How do you implement Role-Based Access Control (RBAC)?**
*Model Answer:* "The User schema has an `isAdmin` boolean (or a `role` string). I have two middleware functions. `protect` verifies the JWT to ensure they are logged in. `adminOnly` runs after `protect`, checks if `req.user.isAdmin` is true, and throws a 403 Forbidden if not. Admin routes look like this: `router.delete('/:id', protect, adminOnly, deleteProduct)`."

**23. What are the security risks of Puppeteer scraping?**
*Model Answer:* "If I'm scraping user-provided URLs (which I'm not in this project, but hypothetically), it could lead to Server-Side Request Forgery (SSRF). The scraper might be tricked into accessing internal cloud metadata endpoints. Also, running headless browsers is memory-intensive; a malicious user triggering a scrape loop could easily cause a Denial of Service (DoS) by crashing the server."

**24. How do you handle file uploads securely?**
*Model Answer:* "If allowing users to upload avatars, I never trust the file extension. I use a library like `multer` to check the MIME type and ensure it's an image. I limit the file size to something small (e.g., 2MB). Finally, I don't store it on the server filesystem; I stream it directly to a secure CDN like AWS S3 or Cloudinary."

**25. What is Helmet.js and why do you use it?**
*Model Answer:* "Helmet is a collection of middleware that sets secure HTTP response headers. For example, it sets `X-Frame-Options` to prevent Clickjacking (putting our site in a hidden iframe). It removes the `X-Powered-By: Express` header so attackers don't immediately know our tech stack. It also helps configure Content Security Policy (CSP)."

**26. How do you prevent Brute Force attacks on your login endpoint?**
*Model Answer:* "I use `express-rate-limit`. I configured a rule specifically for the `/api/auth/login` route that limits requests to 5 attempts per IP address every 15 minutes. If they exceed that, it returns a 429 Too Many Requests status. For higher security, I could implement account lockouts or require a CAPTCHA."

**27. What is Cross-Site Scripting (XSS) and how is TechFreak protected?**
*Model Answer:* "XSS is when an attacker injects malicious JavaScript into our app (e.g., typing a `<script>` tag into a product review). React inherently protects against XSS by automatically escaping variables used in JSX. On the backend, I sanitize inputs using `xss-clean` middleware, and I use `httpOnly` cookies so even if an XSS vulnerability exists, they can't steal the JWT."

**28. How do you version your API?**
*Model Answer:* "Currently, the routes are prefixed with `/api/v1/`. If I ever need to make breaking changes—like drastically altering the Product schema response—I would create a `/api/v2/` router. This allows legacy mobile apps or external clients to continue using v1 without breaking, while the new web app uses v2."

**29. Explain the logic of refreshing a JWT token.**
*Model Answer:* "Currently, I use a single JWT with a moderate expiry (e.g., 30 days). A more secure architecture uses an Access Token (expires in 15 minutes) and a Refresh Token (expires in 7 days). When the access token dies, the client hits a `/refresh` endpoint with the refresh token. The server verifies it and issues a new access token. This allows revoking access quickly without forcing users to log in constantly."

**30. How would you design a real-time notification system for order updates?**
*Model Answer:* "Instead of traditional HTTP requests (polling), I would introduce WebSockets, likely using Socket.io. When the React app loads, it establishes a persistent connection to the Node server. When the Stripe webhook triggers an 'Order Paid' event on the backend, the server emits a socket event to that specific user's room, and the frontend instantly shows a toast notification."
