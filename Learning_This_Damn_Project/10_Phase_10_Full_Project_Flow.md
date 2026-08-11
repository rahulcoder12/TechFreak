# Phase 10: Full Project Flow (End-to-End)

In this final phase, we're zooming out. You've learned how the frontend, backend, and ML services work individually. Now, let's look at how they talk to each other to complete full user journeys.

## 1. User Registration Flow
1. **Frontend:** User fills out signup form.
2. **Frontend:** Dispatches Redux action to call backend `POST /api/v1/user/register`.
3. **Backend:** Validates input, hashes password (bcrypt), generates a 4-digit OTP.
4. **Backend:** Saves user to MongoDB with `isVerified: false`.
5. **Backend:** Calls `sendEmail` utility (using Nodemailer) to send the OTP.
6. **User:** Enters OTP on frontend.
7. **Frontend:** Calls `POST /api/v1/user/verify-email` with the OTP.
8. **Backend:** Verifies OTP, sets `isVerified: true`, generates JWT token.
9. **Frontend:** Saves JWT in cookies/localStorage, updates Redux state to logged in, redirects to home.

## 2. Product Browsing Flow
1. **Frontend:** User lands on homepage. `useEffect` triggers Redux action `getAllProducts`.
2. **Backend:** `GET /api/v1/product/all` fetches from MongoDB, returning JSON.
3. **Frontend:** Redux stores products. React renders product cards.
4. **User:** Types in the search bar.
5. **Frontend:** Redux state updates search keyword, filtering the displayed products on the client-side.
6. **User:** Clicks a product. URL changes to `/product/:id`.
7. **Frontend:** `ProductDetail` component mounts, fetching specific product data by ID.

## 3. Shopping Cart Flow
1. **User:** Clicks "Add to Cart" on a product.
2. **Frontend:** Checks if user is logged in (via Redux). If not, prompts login.
3. **Frontend:** Calls `POST /api/v1/user/add-to-cart/:productId`.
4. **Backend:** Finds user in MongoDB, pushes product ID and quantity to their `cart` array, saves.
5. **Frontend:** On success, triggers `getCartItems` to refresh the cart UI.
6. **User:** Goes to Cart page, sees items, clicks "Remove".
7. **Frontend:** Calls `DELETE /api/v1/user/remove-from-cart/:productId`.
8. **Backend:** Removes item from array, saves.

## 4. Payment Flow (Stripe)
1. **User:** Clicks "Checkout" in cart.
2. **Frontend:** Calculates total client-side, but ALSO sends cart details to backend for a source-of-truth calculation.
3. **Backend:** Calculates total price from DB prices (to prevent client-side tampering).
4. **Backend:** Creates a Stripe Checkout Session using Stripe Node.js SDK. Returns the `sessionId` and URL.
5. **Frontend:** Redirects user to the Stripe-hosted checkout page.
6. **User:** Pays on Stripe.
7. **Stripe:** Redirects user back to frontend success URL.
8. **Stripe (Background):** Sends a Webhook to our backend (`POST /api/v1/payment/webhook`) saying "Payment successful for user X".
9. **Backend:** Receives webhook, verifies signature, creates `Order` document in MongoDB, clears user's cart, sends email receipt via Nodemailer.

## 5. Recommendation Flow
1. **User:** Views `/product/123`.
2. **Frontend:** Fetches product details.
3. **Backend:** While returning product details, it also wants to return recommendations.
4. **Backend:** Fetches *all* products from MongoDB.
5. **Backend -> ML Service:** Sends HTTP POST to `http://ml-service:8000/recommend` containing target ID `123` and the massive list of all products.
6. **ML Service:** Computes TF-IDF and cosine similarity. Returns `[456, 789, 101, 102]`.
7. **Backend:** Fetches those 4 products from MongoDB. Returns them to frontend alongside the main product data.
8. **Frontend:** Displays "Similar Products" carousel.

## 6. Password Reset Flow
1. **User:** Clicks "Forgot Password", enters email.
2. **Backend:** Generates a reset token, hashes it, saves hash + expiration time to User model.
3. **Backend:** Sends email with a link containing the *unhashed* token (e.g., `techfreak.com/reset/xyz123`).
4. **User:** Clicks link, enters new password on frontend.
5. **Frontend:** Calls `PUT /api/v1/user/password/reset/:token`.
6. **Backend:** Hashes the token from the URL, compares with DB. If match and not expired, hashes new password, saves, clears reset token fields.

## When Things Go Wrong (Error Handling)
- **Frontend Layer:** React Error Boundaries catch UI crashes. Axios interceptors catch 401 Unauthorized errors and force logouts. Forms use validation to prevent bad data submission.
- **Backend Layer:** Express middleware `ErrorHandler` catches unhandled exceptions. If MongoDB is down, it sends a 500 error gracefully. If an API route isn't found, the `NotFound` middleware handles it.
- **ML Layer:** Pydantic automatically sends 422 Unprocessable Entity if the backend sends bad JSON.
- **Database Layer:** Mongoose schemas enforce types (e.g., trying to save a string as a price throws a validation error).

---

## 🎤 Interview Prep

**Q: Walk me through exactly what happens, system-wide, when a user clicks 'Buy Now' or 'Checkout'.**
**A:** 
1. "First, the React frontend aggregates the user's cart IDs and requests a checkout session from our Node/Express backend."
2. "The backend doesn't trust the frontend prices. It queries MongoDB for the true prices of those items, calculates the total, and calls the Stripe API to generate a secure Checkout Session."
3. "The backend returns the Stripe Session URL to the frontend, which redirects the user to Stripe's hosted payment page."
4. "The user completes payment securely on Stripe."
5. "Crucially, the success redirect isn't what finalizes the order. Stripe sends an asynchronous Webhook event directly to our backend server."
6. "Our backend receives the webhook, verifies its cryptographic signature to ensure it's actually from Stripe, creates an Order record in MongoDB, empties the user's cart, and triggers Nodemailer to send a receipt."
7. "Meanwhile, the user is redirected back to our frontend's 'Success' page, which optionally polls the backend to confirm the order was saved."

This answer demonstrates deep understanding of security (never trust client prices, verify webhook signatures) and asynchronous system design.
