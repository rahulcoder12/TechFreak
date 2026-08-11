# TechFreak Interview Preparation: Project Questions

This document contains 50+ realistic interview questions about the TechFreak project, categorized by difficulty. The model answers are designed to sound natural, conversational, and based on actual implementation experience. 

## Basic Questions (15 Questions)

**1. Tell me about the TechFreak project.**
*Model Answer:* "TechFreak is a full-stack e-commerce platform I built for tech gadgets. On the frontend, I used React 18 with Vite for fast builds, React Router v6 for navigation, and SWR for data fetching. The backend is an Express.js API talking to MongoDB. I also integrated Stripe for payments and built a separate Python FastAPI service for ML-based product recommendations. It was a great project to tie a bunch of modern web tech together."

**2. Why did you choose React over other frontend frameworks?**
*Model Answer:* "Honestly, mostly because of the ecosystem and my familiarity with it. React 18's concurrent features are great, and pairing it with Vite made the development experience super fast. Plus, libraries like SWR and Formik integrate perfectly with React, which saved me a lot of time on state management and forms."

**3. What does Vite do differently than Create React App?**
*Model Answer:* "Vite is incredibly fast compared to Webpack-based tools like Create React App. During development, it uses native ES modules so it doesn't have to bundle the whole app every time you save a file. It only processes the files you edit, which makes hot module replacement (HMR) almost instant. It just makes working on the UI much less frustrating."

**4. How are you handling state in the frontend?**
*Model Answer:* "I tried to avoid a heavy global state manager like Redux unless absolutely necessary. For server state—like fetching products or user profiles—I rely heavily on SWR. It handles caching, revalidation, and loading states out of the box. For local UI state, just standard React hooks like `useState` and `useContext` for things like the shopping cart or theme toggling."

**5. Why MongoDB instead of a SQL database like PostgreSQL?**
*Model Answer:* "E-commerce data can be kind of hierarchical and document-oriented—like a product having multiple nested variants, reviews, or dynamic attributes. MongoDB's document model fit that really well without needing complex joins right off the bat. It allowed me to iterate quickly on the schema."

**6. Can you explain your backend folder structure?**
*Model Answer:* "I went with a classic MVC (Model-View-Controller) pattern. I have a `models` folder for Mongoose schemas, `controllers` for the actual business logic of the routes, and `routes` to map endpoints to those controllers. I also have a `middlewares` folder for things like authentication checks and error handling. It keeps things modular and easy to find."

**7. How does routing work in your React app?**
*Model Answer:* "I'm using React Router v6. In the main `App.jsx`, I define my routes using the `Routes` and `Route` components. I have public routes like Home and Login, and protected routes wrapped in a custom `ProtectedRoute` component that checks if the user is authenticated before rendering the child components."

**8. What did you use for styling?**
*Model Answer:* "I used Sass. I like having nested rules and variables to keep things organized. I broke my styles down into partials—like `_buttons.scss` or `_variables.scss`—and imported them into a main stylesheet. It kept the CSS from becoming a massive spaghetti file."

**9. How do you handle forms and validation?**
*Model Answer:* "I used Formik for form state management and Yup for validation. For example, on the checkout or login pages, Formik tracks the input values and touched states, while Yup enforces rules like 'password must be 8 characters' or 'email must be valid'. It’s way cleaner than writing dozens of custom `onChange` handlers."

**10. What is SWR and why didn't you just use `useEffect`?**
*Model Answer:* "SWR stands for 'stale-while-revalidate'. If you just use `useEffect` and `fetch`, you have to manually handle loading states, error states, and caching. SWR does all that for you. It serves cached data instantly, then fetches updated data in the background. It makes the app feel way snappier."

**11. How do you handle environment variables?**
*Model Answer:* "On both the frontend and backend, I use `.env` files which are added to `.gitignore` so secrets don't leak. In Node, I use the `dotenv` package to load them into `process.env`. In Vite, they have to be prefixed with `VITE_` to be exposed to the client. Things like API keys and database URIs live there."

**12. What was the purpose of Mongoose in your backend?**
*Model Answer:* "MongoDB is schema-less, which is flexible but can lead to messy data. Mongoose is an ODM (Object Data Modeling) library that lets me define strict schemas, default values, and validation rules at the application level. It also makes querying the database a bit more intuitive than the raw MongoDB driver."

**13. What is JWT and how do you use it?**
*Model Answer:* "JWT stands for JSON Web Token. It's a way to securely transmit information. When a user logs in, my backend generates a token containing their user ID, signs it with a secret key, and sends it back. For future requests, the client sends this token back, and the server verifies it to know who is making the request."

**14. Where are you deploying this project?**
*Model Answer:* "I deployed both the frontend and backend on Vercel. It's really seamless for React apps, and it handles Node.js APIs as serverless functions. My database is hosted on MongoDB Atlas."

**15. What was the hardest bug you had to fix?**
*Model Answer:* "I had a nasty issue with SWR cache not clearing when a user logged out, so the next user logging in on the same machine might briefly see the previous user's cart. I had to explicitly tell SWR to mutate and clear the global cache on the logout function."

---

## Intermediate Questions (15 Questions)

**16. How did you implement authentication securely?**
*Model Answer:* "Instead of storing the JWT in `localStorage`—which is vulnerable to XSS attacks—I send the JWT back from the server as an `httpOnly` cookie. This means JavaScript in the browser can't read it. When the client makes an API call to my Express backend, the browser automatically attaches the cookie. I also use bcryptjs to hash user passwords before storing them in the database."

**17. Tell me about the ML Recommendation service. How does it work?**
*Model Answer:* "It’s a stateless microservice built with FastAPI and Python. It takes a product description or title, and uses Pandas and Scikit-Learn to compute TF-IDF vectors. Then it calculates cosine similarity against a pre-loaded dataset of products to find items that are textually similar. It’s a content-based recommendation approach."

**18. Why use a separate FastAPI service instead of doing it in Node.js?**
*Model Answer:* "Python is just the king of the ML ecosystem. Libraries like Pandas and Scikit-Learn are robust and easy to use. Doing matrix math and text vectorization in Node.js is possible, but much slower and less supported. Keeping it as a separate microservice also meant my Express app wouldn't get blocked by heavy CPU operations."

**19. How did you implement Stripe payments?**
*Model Answer:* "I used Stripe Elements on the frontend to securely collect card details so they never touch my server. The frontend asks the backend for a 'Client Secret'. The Express backend uses the Stripe SDK to create a PaymentIntent and sends the secret back. The frontend then confirms the payment directly with Stripe."

**20. How do you protect your Express backend from common web vulnerabilities?**
*Model Answer:* "I use a package called `helmet` which sets various HTTP headers to protect against things like clickjacking. I also implemented rate limiting using `express-rate-limit` to prevent brute-force attacks, and I sanitize incoming request bodies to prevent NoSQL injection and XSS."

**21. How does your Puppeteer scraping work, and what is it for?**
*Model Answer:* "I used Puppeteer to occasionally scrape external tech blogs or competitor pricing for market analysis or seeding the database. It basically runs a headless Chrome browser, navigates to a URL, and runs DOM queries to extract text or image links. I wrap it in a try-catch because scraping is inherently fragile if the target site changes its HTML."

**22. How are you handling CORS?**
*Model Answer:* "Since my frontend and backend are hosted separately, the browser blocks requests by default. I configured the `cors` middleware in Express to explicitly allow requests originating from my frontend domain on Vercel, and I set `credentials: true` so the `httpOnly` auth cookies can be sent across origins."

**23. Can you explain how you send emails with Nodemailer?**
*Model Answer:* "I use Nodemailer primarily for order confirmations and password resets. I configured it with an SMTP transport (like SendGrid or Gmail). When an order succeeds, my controller calls an email utility function, passing the user's email and an HTML template populated with their order details, and fires off the email asynchronously."

**24. How do you handle pagination in MongoDB?**
*Model Answer:* "I use `skip()` and `limit()` in Mongoose. The frontend sends `page` and `limit` query parameters. The backend calculates `skip = (page - 1) * limit`. It's fine for my current scale, though if the collection gets massive, cursor-based pagination would be better for performance."

**25. How do you manage database connections in a serverless environment like Vercel?**
*Model Answer:* "This is a big gotcha with serverless! Vercel spins up multiple ephemeral functions. If every function opens a new MongoDB connection, you exhaust the connection pool instantly. I wrote a caching mechanism in my DB connection file that checks if a `mongoose.connection` already exists globally. If it does, it reuses it; if not, it establishes a new one."

**26. What happens if the Stripe payment succeeds but your server crashes before saving the order?**
*Model Answer:* "That’s exactly why I implemented Stripe Webhooks. Instead of trusting the frontend to tell me the payment worked, Stripe hits a specific endpoint on my server in the background when the `payment_intent.succeeded` event occurs. Even if the user closes their tab or my server blips, the webhook will retry until my server acknowledges it with a 200 OK and saves the order."

**27. Why did you use React Router v6 instead of older versions?**
*Model Answer:* "v6 introduced a lot of cleaner syntax, like `Routes` instead of `Switch`, and the `useNavigate` hook instead of `useHistory`. It also supports relative routing and nested routes much better, which made structuring the layout—like having a persistent Navbar with changing inner content—much easier."

**28. How does SWR handle revalidation?**
*Model Answer:* "By default, SWR revalidates data when you focus the window, reconnect to the internet, or when it mounts. So if a user buys an item and the inventory drops, the next time they focus the tab, SWR silently checks the server and updates the UI without them having to refresh."

**29. What is a typical middleware pipeline in your Express app?**
*Model Answer:* "A request comes in and hits `helmet` for security headers, then `cors`, then `express.json()` to parse the body. Next, it hits the specific route. If it's a protected route, it goes through an `authMiddleware` that checks the cookie, verifies the JWT, and attaches the `user` to the `req` object. Finally, it hits the controller, or an error handling middleware if something throws."

**30. How do you handle image uploads?**
*Model Answer:* "Instead of saving images directly to MongoDB (which is a bad idea due to document size limits), I upload them to a cloud storage provider like Cloudinary or AWS S3, and just store the resulting URL string in the MongoDB document."

---

## Advanced Questions (10 Questions)

**31. Your ML service is 'stateless'. What does that mean and why is it beneficial?**
*Model Answer:* "Stateless means the FastAPI server doesn't store any session data or state between requests. It just takes an input, runs the ML model, and returns an output. This is great for scaling. If traffic spikes, I can spin up 10 instances of the ML service behind a load balancer, and any instance can handle any request without worrying about shared memory."

**32. How would you optimize the MongoDB queries if the products collection grows to 10 million documents?**
*Model Answer:* "First, I'd ensure appropriate indexes on frequently queried fields, like `category`, `price`, and `name` (maybe a text index). I'd stop using `skip()` for pagination and move to cursor-based pagination (using the last seen `_id`). I'd also use `.lean()` in Mongoose for read-only queries to avoid the overhead of instantiating full Mongoose documents."

**33. What are the trade-offs of using httpOnly cookies vs localStorage for JWT?**
*Model Answer:* "httpOnly cookies are immune to Cross-Site Scripting (XSS) because JavaScript can't read them. However, they are vulnerable to Cross-Site Request Forgery (CSRF). To mitigate CSRF, I'd need to implement SameSite cookie attributes or anti-CSRF tokens. `localStorage` is safe from CSRF but highly vulnerable to XSS. Given how many third-party NPM packages React apps use, XSS is generally the bigger threat, so cookies are safer."

**34. Explain the 'Cosine Similarity' concept in your recommendation engine.**
*Model Answer:* "After TF-IDF converts product descriptions into mathematical vectors (arrays of numbers representing word frequencies), cosine similarity measures the angle between these vectors in multi-dimensional space. If the angle is 0, the cosine is 1, meaning the texts are practically identical. It’s a very fast and effective way to measure how 'close' two products are contextually."

**35. If you had to migrate from MongoDB to PostgreSQL, what architectural changes would you make?**
*Model Answer:* "I'd have to heavily normalize the data. Instead of a single Product document containing an array of Reviews, I'd need separate `Products` and `Reviews` tables with foreign keys. I'd replace Mongoose with an ORM like Prisma or Sequelize. The Node.js logic would mostly stay the same, but the data access layer would require writing joins instead of aggregations."

**36. How do you ensure idempotency in your payment webhook?**
*Model Answer:* "Stripe might send the same webhook event twice. To prevent creating duplicate orders, I use the unique Stripe Event ID. When an event comes in, I check if an order with that Stripe Payment Intent ID already exists in MongoDB. If it does, I return a 200 OK immediately without processing it again."

**37. How would you implement caching on the backend to reduce database load?**
*Model Answer:* "I would introduce Redis. For highly requested, rarely changing data—like the product catalog homepage—the Express controller would first check Redis. If there's a cache hit, it returns the data instantly. If it's a miss, it queries MongoDB, saves the result to Redis with a TTL (Time To Live), and then returns it. When an admin updates a product, I'd invalidate that specific cache key."

**38. What are the performance implications of Serverless Node.js on Vercel?**
*Model Answer:* "The main issue is 'Cold Starts'. If a serverless function hasn't been invoked in a while, Vercel has to boot up the Node environment, connect to MongoDB, and then execute the code, which can add a second or two of latency. To mitigate this, you keep dependencies minimal, use global variables to cache DB connections, or ping the endpoint periodically to keep it warm."

**39. How do you handle database migrations or schema changes in Mongoose?**
*Model Answer:* "Mongoose schemas are application-level, so adding a field is easy. However, if I need to backfill data for existing documents, I can't just change the code. I would write a standalone migration script—using a library like `migrate-mongo`—that connects to the DB, loops through older documents, applies the new default values, and commits the changes safely."

**40. Walk me through the security mechanisms protecting user passwords.**
*Model Answer:* "When a user registers, the raw password is sent via HTTPS to the server. The Express controller uses `bcrypt.hash()` with a salt round of 10 or 12. This generates a unique cryptographic hash. We store *only* the hash in MongoDB. When logging in, we use `bcrypt.compare()` which hashes the provided input and checks if it matches the stored hash. Even if the database is leaked, the original passwords are computationally unfeasible to reverse."

---

## Follow-up Questions (10 Questions)

**41. You mentioned using SWR for data fetching. What if you need to mutate data, like deleting an item?**
*Model Answer:* "SWR provides a `mutate` function. When I send a DELETE request to the backend and it succeeds, I call `mutate('/api/products')`. SWR instantly re-fetches the list, updating the UI. Or, for even better UX, I can use optimistic UI: I update the local cache *before* the server responds, and if the server fails, I roll it back."

**42. You said you use bcrypt for passwords. What is 'salting' and why is it necessary?**
*Model Answer:* "Salting adds random string data to the password before hashing. This ensures that even if two users have the password 'password123', their hashes will look completely different in the database. It prevents attackers from using pre-computed tables (Rainbow Tables) to crack common passwords."

**43. On the ML engine, TF-IDF is used. What happens when your product database grows to 100,000 items?**
*Model Answer:* "Calculating cosine similarity against 100,000 items on every request would be too slow. I'd have to pre-compute the similarity matrices offline in a batch process and store them in a fast database like Redis, or use an approximate nearest neighbor search library like FAISS instead of calculating exact cosine similarity on the fly."

**44. You mentioned checking auth in a protected route. How exactly does the frontend know if the user is authenticated if the JWT is in an httpOnly cookie?**
*Model Answer:* "Since JS can't read the cookie, I have a specific `/api/auth/me` endpoint. When the React app loads, it pings this endpoint. If the cookie is valid, the server returns the user profile data, and I store that in React context. If it fails, I know the user isn't authenticated and redirect them to login."

**45. For Stripe, why use a Webhook instead of trusting the frontend success callback?**
*Model Answer:* "Because the frontend runs on the client's machine. A malicious user could easily mock the success callback or modify the network request to tell the server 'I paid' without actually paying. The server must only trust secure, backend-to-backend communication from Stripe's servers."

**46. You used Vite for fast builds. Does it bundle the code for production differently than development?**
*Model Answer:* "Yes. In development, Vite uses native ES modules to serve files as the browser requests them. But for production, it uses Rollup under the hood to highly optimize, tree-shake, and bundle the code into static assets for maximum performance."

**47. If your Puppeteer scraper runs into a CAPTCHA, how do you handle it?**
*Model Answer:* "Standard Puppeteer is easily detected by CAPTCHAs. I could use `puppeteer-extra-plugin-stealth` to evade basic detection. If that fails, I'd either have to use a third-party CAPTCHA solving service, or better yet, look for a public API instead of scraping the HTML directly."

**48. Why use JWT instead of traditional server-side sessions?**
*Model Answer:* "Because my architecture has a React frontend and an Express backend, often hosted on different domains or serverless environments. Traditional sessions require storing session IDs in memory or a database on the backend. JWTs are stateless—the server verifies them cryptographically without needing to do a database lookup, making it easier to scale."

**49. How do you prevent NoSQL injection in your MongoDB queries?**
*Model Answer:* "MongoDB queries often use JSON objects. If a user passes an object like `{"$gt": ""}` into a login form, they could bypass auth. I use a middleware like `express-mongo-sanitize` which recursively strips out any keys starting with `$` or `.` from `req.body`, `req.query`, and `req.params`."

**50. You used Sass. If you were starting today, would you choose Tailwind over Sass?**
*Model Answer:* "Probably Tailwind. While Sass is great for organization, Tailwind's utility-first approach means I never have to context-switch between JSX and CSS files. It also naturally prevents dead CSS from accumulating, because the production build only ships the classes you actually used."
