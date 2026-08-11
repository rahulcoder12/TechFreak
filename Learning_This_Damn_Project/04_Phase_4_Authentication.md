# Phase 4: Authentication & Security

Security and authentication are critical parts of any application. In TechFreak, we handle user logins, route protection, and sensitive actions (like password resets). This document explains the complete auth flow.

---

## 1. The Core Technology: JSON Web Tokens (JWT)

### What is a JWT?
A JSON Web Token is a secure, compact way to transmit information between a client and a server. In our project, it serves as a digital VIP pass. Once a user logs in, they get a JWT. For every subsequent request, they show this pass to prove who they are.

A JWT has three parts (`Header.Payload.Signature`):
1. **Header**: Tells the server what algorithm was used to sign the token.
2. **Payload**: The actual data (in our case, the User's ID: `data: id`).
3. **Signature**: A cryptographic hash created using the Header, Payload, and our secret key (`process.env.JWT_SECRET`). If a hacker tampers with the Payload, the Signature becomes invalid, and the server rejects it.

### Why JWTs over Sessions?
Traditional session-based auth stores a session ID in a database/memory on the server. The server has to look up that ID on every request. 
**JWT is stateless.** The server doesn't need to look up a session in the database; it just mathematically verifies the token's signature. This is incredibly efficient and scales perfectly in microservice architectures.

---

## 2. Walkthrough: `authController.js` ([file](file:///Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend/controller/authController.js))

Let's look at the key flows in the authentication controller.

### Signup & Login
When a user signs up or logs in (`exports.signup`, `exports.login`), the server does three things:
1. Validates credentials (using `bcrypt` to compare passwords in `checkUserCredentials`).
2. Calls `signJwt(user._id)` to generate the token.
3. Calls `sendCookie(req, res, token)` to send the token back to the browser.

### The Power of `httpOnly` Cookies
Look at how the cookie is sent in `sendCookie`:
```javascript
return cookies.set('jwt', token, {
  sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
  secure: process.env.NODE_ENV === 'development' ? false : true,
  path: '/',
  httpOnly: true, // THIS IS CRUCIAL
});
```
**Why `httpOnly`?** 
If we stored the JWT in the browser's `localStorage`, any JavaScript running on the page could read it. If a hacker manages to inject malicious JavaScript (an **XSS attack**), they could steal the token.
Setting `httpOnly: true` means the browser hides the cookie from JavaScript. The browser will automatically attach the cookie to HTTP requests, but code cannot read it. This completely neutralizes token theft via XSS!

### Route Protection: The `protected` Middleware
How do we stop unauthenticated users from accessing private routes (like updating a password)? We use the `protected` middleware.

```javascript
exports.protected = catchAsync(async (req, res, next) => {
  // 1. Check if the token exists in cookies
  if (!req.cookies.jwt) return next(createError(401, '...'));
  
  // 2. Verify the token signature mathematically
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  
  // 3. Find the user from the decoded ID payload
  const user = await users.findById(decoded.data);
  if (!user) return next(createError(401, '...'));
  
  // 4. Attach the user to the request and move to the next middleware!
  req.user = user;
  next();
});
```
Any route using this middleware guarantees that `req.user` exists for the next function.

---

## 3. Account Activation & Password Reset

### Email Verification Flow
When a user signs up, their account is `active: false`. 
1. `confirmAccount()` on the user model creates a random token (`rand-token`) and an expiry date (10 minutes).
2. It encrypts this token using `Cryptr` and emails it to the user.
3. When the user clicks the link, `exports.activateAccount` decrypts the token, checks if it matches the DB, checks the expiry time, and sets `active: true`.

### Password Reset Flow
Very similar to email verification:
1. User requests a reset; we generate a `passwordResetToken` and `passwordExpiresDate`.
2. User receives an email with an encrypted token link.
3. `exports.checkValidPasswordResetToken` ensures the token is valid and hasn't expired.
4. `exports.resetPassword` updates the database with the new password (triggering our pre-save hook to hash it) and clears the old reset tokens.

---

## 4. Security Best Practices & Tradeoffs

### What We Did Right:
- **`httpOnly` Cookies:** Protects against Cross-Site Scripting (XSS) token theft.
- **Bcrypt Hashing:** Prevents catastrophic data leaks if the database is compromised.
- **Token Expiry:** JWTs expire in 7 days, and reset tokens expire in 10 minutes, limiting the window of opportunity for attackers.
- **Select: false:** Hiding sensitive fields in Mongoose queries by default.

### What We Missed (Room for Improvement):
- **Refresh Tokens:** Currently, the JWT lasts 7 days. If compromised, the attacker has it for 7 days. A better approach is a short-lived Access Token (15 mins) and a long-lived Refresh Token.
- **CSRF Protection:** Because we use cookies, we are vulnerable to Cross-Site Request Forgery (CSRF). If a user visits a malicious site while logged into our app, the malicious site could force the browser to send a request to our API (and the browser will auto-attach the cookie). We should implement a CSRF token.
- **Rate Limiting:** There is no protection against someone spamming the login route to brute-force a password.

---

## 5. Interview Prep

**Q: Why did you use JWTs instead of traditional sessions?**
> *"I opted for JWTs because they are stateless. The server doesn't have to keep track of active sessions in memory or query a database to validate a user on every request. It simply verifies the token's cryptographic signature. This makes the backend much more scalable and decoupled, which is ideal if the app were to grow into a microservices architecture."*

**Q: Where do you store the JWT on the frontend and why?**
> *"I strictly do not store JWTs in localStorage due to XSS (Cross-Site Scripting) vulnerabilities. If a bad actor injects a script, they can easily read localStorage and steal the token. Instead, I send the token back in an `httpOnly` cookie. This instructs the browser to never expose the cookie to JavaScript, significantly boosting security."*

**Q: What is a CSRF attack and how does it relate to your cookie strategy?**
> *"Because I use cookies to store the JWT, the browser automatically attaches the cookie to any outgoing request to my domain. In a CSRF (Cross-Site Request Forgery) attack, a malicious website forces the user's browser to make an unwanted request to my API. Since the cookie is attached automatically, my API thinks it's a legitimate request. In a production environment, I would mitigate this by implementing Anti-CSRF tokens alongside the cookies or enforcing strict `SameSite` cookie policies."*
