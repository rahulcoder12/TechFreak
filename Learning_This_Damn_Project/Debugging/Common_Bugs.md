# TechFreak: Common Bugs & Fixes

When developing or running TechFreak, you might encounter these frequent issues. Here is a cheat sheet on what causes them and how to fix them.

---

### 1. CORS Issues in Development
**Symptom**: Frontend makes a request to the backend and the browser console shows a "Cross-Origin Request Blocked" error.
**Cause**: The React app runs on `localhost:5173` and the Express app runs on `localhost:5000`. Browsers block this by default.
**Fix**: Ensure the `cors` middleware in Express is configured to accept the frontend origin, AND ensure credentials (cookies) are allowed.
```javascript
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
```

### 2. JWT Token Expiry Handling
**Symptom**: User is suddenly logged out, or API calls start returning `401 Unauthorized` without a graceful UI update.
**Cause**: The JWT expired.
**Fix**: Catch `401` errors globally in your Axios/fetch interceptor. Redirect the user to the login page and clear local state, or implement a Refresh Token endpoint to silently get a new token.

### 3. MongoDB Connection Timeout
**Symptom**: Backend logs show `MongoTimeoutError: Server selection timed out`.
**Cause**: IP address is not whitelisted in MongoDB Atlas, OR Vercel functions exhausted the connection pool.
**Fix**: Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access for Vercel, and ensure `mongoose.connect()` is cached outside the serverless handler scope.

### 4. Stripe Webhook Failures
**Symptom**: Payment succeeds on Stripe, but the order status in the database remains "pending".
**Cause**: The Stripe webhook cannot reach your local server, or the webhook secret is wrong.
**Fix**: In development, use the Stripe CLI to forward events: `stripe listen --forward-to localhost:5000/api/webhook`. Ensure `STRIPE_WEBHOOK_SECRET` is set correctly in `.env`. *Note: Webhook endpoints must receive the raw body, not parsed JSON.*

### 5. SWR Cache Stale Data
**Symptom**: User updates their profile, but the navbar still shows the old data until page refresh.
**Cause**: SWR's local cache hasn't been invalidated.
**Fix**: Call the `mutate()` function provided by SWR after a successful PUT/POST request to force SWR to re-fetch the data immediately.

### 6. Rate Limit False Positives
**Symptom**: Users randomly get `429 Too Many Requests` even when they haven't made many requests.
**Cause**: In a Vercel serverless environment, in-memory rate limiters behave unpredictably because instances spin up and down.
**Fix**: Switch the rate limiter to use a Redis store (e.g., Upstash) instead of local memory.

### 7. Puppeteer Scraper Blocking
**Symptom**: Scraper returns `403 Forbidden` or a CAPTCHA page.
**Cause**: Target websites detect headless Chrome and block the automated request.
**Fix**: Use `puppeteer-extra-plugin-stealth`, rotate User-Agents, and implement randomized delays between requests.

### 8. Environment Variable Misconfiguration
**Symptom**: App crashes on startup or 3rd party APIs (Stripe, MongoDB) fail.
**Cause**: Missing or misspelled keys in `.env`.
**Fix**: Always validate environment variables on startup. Use a tool like `envalid` to crash the app loudly and early if a required variable is missing.

### 9. Vercel Cold Start Issues
**Symptom**: First API request takes 5-10 seconds to resolve.
**Cause**: Serverless functions go to sleep when inactive. The next request requires spinning up a new container.
**Fix**: Keep functions lightweight. If acceptable, set up a cron job (like Vercel Cron or cron-job.org) to ping the API every 5 minutes to keep it warm.
