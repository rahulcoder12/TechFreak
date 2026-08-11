# TechFreak: Troubleshooting & Debugging Guide

Debugging full-stack applications can be overwhelming. Follow this guide to methodically isolate and fix issues in the TechFreak stack.

---

## 🛠 Debugging Express APIs

When an API endpoint isn't behaving as expected:
1. **Isolate the API**: Stop using the React frontend. Use **Postman** or **cURL** to send requests directly to `http://localhost:5000`. This proves whether the bug is in the frontend or backend.
2. **Read the Console**: Look at the terminal running the backend. Are there stack traces?
3. **Use Debugging Middleware**: Temporarily add a logger middleware at the top of your Express app to log incoming requests:
   ```javascript
   app.use((req, res, next) => {
       console.log(`[${req.method}] ${req.url} - Body:`, req.body);
       next();
   });
   ```
4. **Use VS Code Debugger**: Don't rely solely on `console.log`. Start your server with node's `--inspect` flag or use the VS Code built-in debugger to set breakpoints and inspect variables in real-time.

---

## ⚛️ Debugging React Components

When the UI looks wrong or state isn't updating:
1. **React DevTools**: Install the browser extension. Inspect the component tree to see the exact `props` and `state` a component currently holds.
2. **Network Tab**: Open Browser DevTools -> Network. Look at the API requests being made. Are they returning 200 OK? What is the JSON payload?
3. **Error Boundaries**: If the whole screen goes white, it's an unhandled runtime error. Check the browser console. Wrap components in an Error Boundary to catch these gracefully.

---

## 🗄 Debugging MongoDB Queries

When data isn't returning correctly or queries are slow:
1. **MongoDB Compass**: Use the Compass GUI to manually run the query and verify the data actually exists in the format you expect.
2. **Use `.explain()`**: If a query is slow, append `.explain("executionStats")` to your Mongoose query to see if it's scanning the whole collection (COLLSCAN) or using an index (IXSCAN).
3. **Check Indexes**: Remember that the Text index in the `Product` model is currently unused. Ensure your indexes actually match your query patterns.

---

## 💳 Debugging Stripe Integration

When payments fail:
1. **Test Mode**: ALWAYS ensure you are using Stripe test API keys (starting with `pk_test_` and `sk_test_`) locally. Use Stripe's test card numbers (e.g., 4242 4242 4242 4242).
2. **Stripe Dashboard Logs**: Go to the Stripe Developer Dashboard -> Logs. Stripe records every API request and response. You can see exactly why a payment failed here.
3. **Webhook Logs**: In the Dashboard -> Webhooks, you can see if Stripe is successfully sending events to your server or if they are failing.

---

## 🔐 Debugging Authentication

When users can't log in or access protected routes:
1. **Check Cookies**: Open Browser DevTools -> Application -> Cookies. Do you see the `jwt` cookie? If not, the backend isn't setting it, or CORS settings are preventing it.
2. **Check Token Payload**: Copy the JWT value and paste it into `jwt.io` to decode it. Does it contain the correct user ID? Has the `exp` (expiration time) passed?

---

## 🌐 Common HTTP Error Codes in TechFreak

- **`400 Bad Request`**: The frontend sent invalid data (e.g., missing required fields, failing Yup validation).
- **`401 Unauthorized`**: Missing, invalid, or expired JWT. User needs to log in.
- **`403 Forbidden`**: Valid token, but the user doesn't have permission (e.g., a normal user trying to access an Admin route).
- **`404 Not Found`**: The requested resource (e.g., product ID) doesn't exist in the database.
- **`500 Internal Server Error`**: The backend crashed. Check the backend terminal logs immediately.
