# TechFreak Follow-up Question Chains

This document simulates a tough technical interview where the interviewer keeps asking "why" or "how." This tests deep understanding, not just memorization.

---

### Chain 1: Authentication & Security

**Q1: How did you implement authentication in TechFreak?**
*Answer:* I used JSON Web Tokens (JWT). When a user logs in, the Express server verifies their credentials using bcrypt, generates a JWT, and sends it back to the client. The client then sends this token with subsequent requests to access protected routes.

**Q2: Where do you store that JWT on the frontend?**
*Answer:* I specifically chose *not* to store it in `localStorage` or `sessionStorage`. Instead, the backend sets the JWT in an `httpOnly` cookie.

**Q3: Why use an httpOnly cookie instead of localStorage?**
*Answer:* Because `localStorage` is accessible via JavaScript. If my app had a Cross-Site Scripting (XSS) vulnerability, a malicious script could easily read the token and steal the user's session. An `httpOnly` cookie cannot be accessed by client-side JavaScript, effectively mitigating that specific XSS risk.

**Q4: If the cookie is httpOnly, how does your React app know if the user is logged in to update the UI (like showing a 'Logout' button)?**
*Answer:* Great question. Since React can't read the cookie, I created a specific endpoint, like `/api/auth/me`. When the app loads, SWR pings this endpoint. If the httpOnly cookie is valid, the server responds with the user's basic info (name, email). If it's invalid or missing, it returns a 401, and React updates the state to show the user as logged out.

**Q5: What about CSRF (Cross-Site Request Forgery) attacks? Cookies are vulnerable to that.**
*Answer:* Yes, they can be. I mitigated this by setting the `SameSite=Strict` (or `Lax`) attribute on the cookie when the backend creates it. This tells the browser not to send the cookie along with cross-site requests, protecting against standard CSRF attacks.

---

### Chain 2: Data Fetching & State

**Q1: How are you managing state in your React application?**
*Answer:* I distinguish between UI state and server state. For simple UI state (like a modal being open), I just use `useState`. But for server state (like product lists or cart data), I use SWR.

**Q2: Why SWR instead of Redux or Context API?**
*Answer:* Redux is a global state manager, but most of what we call "state" in web apps is actually just a cache of the database. SWR is designed specifically for data fetching and caching. It handles loading states, error states, and background revalidation automatically. Redux would require writing actions, reducers, and thunks just to fetch and store a list of products.

**Q3: How does SWR's background revalidation work in your app?**
*Answer:* SWR uses a "stale-while-revalidate" strategy. When the user navigates to a product page they've visited before, SWR instantly shows the cached product data (stale). In the background, it silently fetches the latest data from the Express server (revalidate) and seamlessly updates the UI if anything changed. It makes the app feel incredibly fast.

**Q4: What happens if a user adds an item to their cart? Does SWR automatically know to update the cart icon count?**
*Answer:* Not automatically, because it's a mutation. When I make a POST request to add to the cart, I use SWR's `mutate` function. I tell SWR, "Hey, the data at the `/api/cart` endpoint has changed. Please refetch it." This updates the cache and triggers a re-render of any component listening to that data, like the cart icon in the navbar.

---

### Chain 3: The Recommendation Microservice

**Q1: I see you have a separate Python service for recommendations. Why didn't you just write that in Node.js with your main API?**
*Answer:* Node.js is excellent for I/O bound tasks and building web servers, but it's single-threaded and not optimized for heavy CPU-bound tasks like machine learning matrix operations. Python has a rich ecosystem for data science, specifically Pandas and Scikit-Learn. Decoupling it into a microservice allowed me to use the best tool for the job.

**Q2: How does the Node.js backend communicate with the Python FastAPI service?**
*Answer:* They communicate over HTTP. When a user views a product, the React frontend asks the Node backend for recommendations. The Node backend makes an internal HTTP GET request (e.g., using `axios` or `fetch`) to the FastAPI service, passing the current product's ID or description. FastAPI calculates the similarities, returns the recommended product IDs to Node, and Node sends them back to React.

**Q3: You mentioned TF-IDF and Cosine Similarity. Explain that to me like I'm 5.**
*Answer:* Imagine two books. TF-IDF counts how many unique, important words they share. It ignores common words like "the" or "and" (Term Frequency) but gives high value to rare, specific words like "motherboard" (Inverse Document Frequency). Cosine Similarity then takes those word counts and measures the angle between them. If the angle is small, the books are very similar. So, if two products have similar unique keywords in their descriptions, the engine recommends them.

**Q4: Since it's a stateless service, how does FastAPI get the product data to compare?**
*Answer:* Currently, since it's a lightweight implementation, the FastAPI service loads a static CSV or JSON dataset of the products into a Pandas DataFrame when the server starts. When a request comes in, it runs the comparison against that in-memory data. 

**Q5: How would you handle it if you had a million products? Loading that in memory wouldn't scale.**
*Answer:* You're exactly right. For a million products, calculating cosine similarity on the fly for the entire dataset would be too slow and memory-intensive. In a real-world v2, I would pre-calculate the similarities periodically (e.g., via a nightly cron job) and store the results (the recommended product IDs for each item) in a fast read-database like Redis or a dedicated vector database like Pinecone. Then FastAPI would just quickly look up the pre-calculated answers.

---

### Chain 4: Database & Modeling

**Q1: Why did you choose MongoDB for this project over a SQL database like PostgreSQL?**
*Answer:* E-commerce product catalogs often have highly variable attributes. A laptop has RAM and CPU specs, while a t-shirt has size and color. MongoDB's flexible, schema-less document structure handles this polymorphism well without needing complex JOIN tables for every attribute type. 

**Q2: But MongoDB is schema-less. How do you ensure data integrity so a product doesn't accidentally get saved with a price of "five dollars" instead of an integer?**
*Answer:* I used Mongoose in my Express application. Mongoose acts as an Object Data Modeling (ODM) library. It allows me to define strict schemas at the application level. I defined `price` as a `Number` and made it `required`. If a route tries to save a string there, Mongoose throws a validation error before it ever reaches the database.

**Q3: How are you modeling the shopping cart? Is it a separate collection or embedded in the user?**
*Answer:* For a typical e-commerce site where carts might grow large or persist for a long time, embedding the entire cart inside the User document can lead to massive documents that exceed MongoDB's limits and slow down queries when you just want basic user info. I created a separate `Cart` collection. Each cart document references a `userId` and contains an array of items, where each item references a `productId`.

**Q4: What happens to an order's history if a product's price changes later?**
*Answer:* That's a classic database design trap! When an order is placed, I do *not* just save a reference to the `productId`. If I did, viewing an old order would show the *current* price, not the price paid. Instead, when saving an `Order` document, I copy the critical snapshot data: the product name, the specific price at that moment, and the quantity.

---

### Chain 5: Deployment & Architecture

**Q1: How is the application deployed?**
*Answer:* It's a decoupled architecture. The React frontend is deployed on Vercel, which provides a fast CDN. The Express backend and the FastAPI Python service are deployed separately, perhaps on platforms like Render or Heroku. The MongoDB database is hosted on MongoDB Atlas.

**Q2: What's the benefit of deploying the frontend and backend separately?**
*Answer:* It allows them to scale independently. If my UI gets a lot of traffic but the backend is mostly cached, I only need to scale the Vercel edge nodes. Also, it completely separates the build processes. I can deploy a quick CSS fix to the frontend without restarting the Express server or causing backend downtime.

**Q3: How do you manage environment variables across these different services?**
*Answer:* I use `.env` files locally, ensuring they are strictly added to `.gitignore`. In production, I use the dashboard of the respective hosting providers (Vercel, Render) to inject environment variables securely. I make sure my React app only has access to variables prefixed with `VITE_` (like the public Stripe key), while the backend keeps secrets (like the JWT secret, MongoDB URI, and private Stripe key) completely hidden from the client.

*(Add more chains as needed for Formik/Yup, Vite vs CRA, Stripe implementation, etc.)*
