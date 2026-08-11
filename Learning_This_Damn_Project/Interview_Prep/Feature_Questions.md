# TechFreak Feature Deep-Dive Questions

This file breaks down the project feature by feature, providing basic, intermediate, and advanced questions an interviewer might ask, along with debugging scenarios.

---

## 1. Authentication (JWT & Cookies)

### Basic
**Q: What library did you use to hash passwords?**
*A:* I used `bcryptjs`. It's a standard algorithm for password hashing that includes a salt to protect against rainbow table attacks.
**Q: What is a JWT?**
*A:* A JSON Web Token. It's an encoded string that contains a payload (like the user's ID). It's signed by the server using a secret key, so the server can verify it hasn't been tampered with.
**Q: How does a user log out?**
*A:* The client makes a request to a `/logout` endpoint, and the server responds by clearing the `httpOnly` cookie (e.g., setting its expiration date to the past). The frontend then updates its state.

### Intermediate
**Q: Explain the difference between `localStorage` and `httpOnly` cookies for tokens.**
*A:* `localStorage` is easily accessible via JavaScript, making it highly vulnerable to XSS attacks. An `httpOnly` cookie is managed by the browser and cannot be read by client-side scripts, neutralizing that XSS threat.
**Q: How do you protect certain React routes (like an Admin dashboard) from unauthorized users?**
*A:* I created a `<ProtectedRoute>` wrapper component. It checks the SWR state for the authenticated user. If the user isn't loaded or lacks admin privileges, it uses React Router's `<Navigate>` component to redirect them to the login page.
**Q: How does the backend know who is making the request?**
*A:* I wrote a custom Express middleware called `protect`. It parses the cookie from the incoming request, verifies the JWT using the server's secret key, decodes the user ID, fetches the user from MongoDB, and attaches that user object to the `req` object (e.g., `req.user`) before passing control to the controller.

### Advanced
**Q: What happens if your JWT secret key gets leaked?**
*A:* Anyone with the key can forge valid JWTs and impersonate any user, including admins. To fix it, I would immediately change the secret key on the server. This would instantly invalidate all existing tokens, forcing everyone to log in again.
**Q: How would you implement a "Remember Me" feature securely?**
*A:* Instead of just making the main JWT last longer, I would implement a Refresh Token architecture. A short-lived Access Token is used for API calls, and a long-lived Refresh Token (stored securely in the database and a cookie) is used to get new access tokens.

### Debugging Scenario
**Scenario:** A user logs in successfully, but when they refresh the page, they are logged out.
**Answer:** The React app state resets on refresh. Since the token is in an `httpOnly` cookie, React can't read it directly. The issue is likely that the frontend isn't firing the `/api/auth/me` request on initial load to verify the cookie and re-populate the user state, or that request is failing (maybe the cookie domain/path is set wrong).

---

## 2. Product Management & Catalog

### Basic
**Q: How do you fetch products from the backend?**
*A:* I use the SWR hook (`useSWR`) to make a GET request to the `/api/products` endpoint.
**Q: How do you show a loading spinner while products fetch?**
*A:* SWR returns an `isLoading` property. In my component, I just write `if (isLoading) return <Spinner />;`.
**Q: How do you handle images for products?**
*A:* (Depending on exact implementation) Currently, they are stored as URL strings in the MongoDB database, pointing to hosted images.

### Intermediate
**Q: How did you implement product pagination?**
*A:* The frontend passes `page` and `limit` query parameters (e.g., `?page=2&limit=10`). The backend Express controller uses Mongoose's `.skip()` and `.limit()` methods based on those parameters to return only the requested chunk of data, plus total page metadata.
**Q: How do you update a product's details?**
*A:* I created an Admin-only PUT route. The frontend sends the updated data. Mongoose finds the document by ID and updates it. Crucially, I have to call SWR's `mutate` on the frontend afterward so the cache updates with the new data.

### Advanced
**Q: If you have 50,000 products, `.skip()` gets very slow for high page numbers. How do you optimize pagination?**
*A:* I would switch from offset-based pagination (`skip`) to cursor-based pagination. Instead of skipping 40,000 records, the client sends the ID of the last item they saw, and the query looks for `_id > last_seen_id` with a limit. This uses the index and is O(1) instead of O(N).

### Debugging Scenario
**Scenario:** The product list page is incredibly slow to load, taking 4-5 seconds.
**Answer:** First, I'd check the network tab. Is the payload huge? If the API is returning the entire database instead of paginating, I need to fix the backend limit. Second, I'd check the database. Does the `Products` collection lack indexes on commonly queried fields like `category` or `price`? Adding an index in MongoDB would speed up the search significantly.

---

## 3. Shopping Cart & Checkout

### Basic
**Q: Where is cart data stored?**
*A:* It is stored in the MongoDB database so it persists across devices.
**Q: How do you calculate the cart total?**
*A:* On the frontend, I use the JavaScript `reduce` array method to iterate over the cart items, multiplying price by quantity and summing them up. I also re-calculate this on the backend to ensure security.

### Intermediate
**Q: Why must you recalculate the total on the backend before sending it to Stripe?**
*A:* Never trust the client. A malicious user could intercept the network request and change the cart total to $1.00. The backend must look up the product IDs in the database, get the *real* prices, calculate the total there, and send that trusted amount to Stripe.
**Q: How do you handle a user adding an item that is already in the cart?**
*A:* The backend controller checks if the `productId` already exists in the user's cart array. If it does, it increments the `quantity` of that existing item instead of pushing a duplicate object into the array.

### Advanced
**Q: What happens if a user adds an item to their cart, leaves for a week, and the item's price goes up?**
*A:* In my current implementation, the cart just stores the `productId`, so when they return, it fetches the *current* price. However, when they actually create an *Order*, the exact price they paid at that moment is locked into the Order document.

### Debugging Scenario
**Scenario:** A user clicks "Add to Cart" rapidly 5 times, but only 2 items are added.
**Answer:** This is a race condition. The frontend might be firing 5 separate POST requests simultaneously. If they hit the database at the exact same millisecond before the first one finishes updating the document, they overwrite each other. Solution: Disable the button while loading, or use an atomic `$inc` operation in MongoDB rather than fetching, adding, and saving in Node.

---

## 4. Payment Processing (Stripe)

### Basic
**Q: What is Stripe Elements?**
*A:* It's a set of pre-built UI components from Stripe that securely collect credit card details. The raw card numbers never actually touch my server; they go straight from the React frontend to Stripe's servers.
**Q: What is a PaymentIntent?**
*A:* It's an object created on the backend that tracks the lifecycle of a payment. It returns a `client_secret` to the frontend, allowing the frontend to securely finalize the transaction.

### Intermediate
**Q: Explain the step-by-step payment flow.**
*A:* 
1. User clicks checkout. React tells Node to create a PaymentIntent.
2. Node calculates the trusted total, calls the Stripe API, gets a `client_secret`, and sends it to React.
3. User enters card info into Stripe Elements.
4. React uses the `client_secret` and Stripe Elements to send the card directly to Stripe.
5. Stripe processes it and tells React "Success".
6. React tells Node "Order complete", and Node saves the order to MongoDB.

### Advanced
**Q: Step 6 in your flow is vulnerable. What if the user closes their laptop after Step 5, before React tells Node to save the order? They paid, but have no order.**
*A:* You're exactly right. Trusting the frontend to finalize the order is a flaw. To make this production-ready, I would implement Stripe Webhooks. My Node server would expose an endpoint that Stripe directly pings when a payment succeeds. The server would create the MongoDB order based on that webhook, completely bypassing the fragile frontend connection.

---

## 5. ML Recommendation Engine (FastAPI)

### Basic
**Q: What does the Python microservice do?**
*A:* It takes a product ID, compares its description and attributes against all other products using TF-IDF and Cosine Similarity, and returns a list of the 5 most similar product IDs.
**Q: Why use FastAPI?**
*A:* It's incredibly fast, modern, and very easy to set up for simple APIs compared to heavier frameworks like Django. It also automatically generates Swagger documentation.

### Intermediate
**Q: What is TF-IDF?**
*A:* Term Frequency-Inverse Document Frequency. It's a text analysis technique. It finds words that are frequent in one specific product description but rare across the entire catalog, identifying the unique keywords that define that product.
**Q: How does the data get from MongoDB to the Python service?**
*A:* For this prototype, I used a static dataset (CSV) loaded into Pandas when the FastAPI app starts. In a more advanced version, Python could connect directly to a read-replica of the MongoDB database or consume events via a queue.

### Advanced
**Q: "Stateless recommendation engine" — what does that mean in your architecture?**
*A:* It means the Python service doesn't track user sessions, past purchases, or state. It simply receives input (a product), does math, and returns output. It's purely content-based filtering, not collaborative filtering (like "users who bought X also bought Y").

### Debugging Scenario
**Scenario:** The Node backend is throwing a 500 timeout error when requesting recommendations.
**Answer:** The FastAPI service might be down, or the calculation is taking too long. I would check the logs on the Python service. If the catalog grew too large, the matrix calculation is blocking the thread. The solution is caching the results or moving the calculation out of the request-response cycle.
