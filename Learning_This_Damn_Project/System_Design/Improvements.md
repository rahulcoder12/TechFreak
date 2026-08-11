# TechFreak: Specific Improvements for v2

This document outlines concrete, actionable improvements to refactor the current codebase and prepare it for version 2.0. These focus on cleaning up technical debt and adding essential production features.

## 🧹 1. Code Cleanup & Dead Code Removal

The codebase currently has several pieces of unused or duplicated code that need to be removed to reduce confusion and bundle size:

- **Remove `recommendationEngine.js`**: The logic here is completely duplicated inside `productController.js`. Delete the standalone file.
- **Delete `ModalBox.jsx`**: This frontend component is completely empty. Remove it.
- **Clean up `userController.js`**: Remove the commented-out `multer` logic to improve readability.
- **Clean up `productModel.js`**: Remove the commented-out Rainforest API logic.

## 🛠 2. Refactoring Existing Logic

- **Fix MongoDB Search Index**: The `Product` model defines a text index, but the search controller uses a `$regex` query. 
  - *Action*: Refactor the search controller to use `$text` and `$search` operators to utilize the index for better performance.
- **Extract Email Templates**: HTML templates for emails are currently inline within `userModel.js`. 
  - *Action*: Move these to a separate `/templates` directory (e.g., using EJS or Handlebars) to keep the models clean.
- **Optimize Frontend Data Fetching**: There are redundant implementations of SWR and React Router v6 Loaders on the same routes.
  - *Action*: Standardize on one approach. If using React Router v6, use Loaders for initial data, and SWR for polling/mutations, but don't double-fetch.
- **Optimize ML Service**: Fix the stateless ML issue.
  - *Action*: Prevent the TF-IDF matrix from being recomputed on every request. Compute it once on startup and cache it, or move to pre-computed embeddings.
- **Add missing `requirements.txt`**: The ML service is missing dependency tracking.
  - *Action*: Run `pip freeze > requirements.txt` in the ML service directory.

## ✨ 3. New Features for v2

- **Refresh Token Rotation**: Currently, only short-lived JWTs are used. Implement a refresh token stored in an httpOnly cookie, and rotate it securely to improve session UX and security.
- **Cloud Image Uploads**: Replace any local disk storage attempts with cloud storage integrations (e.g., AWS S3 or Cloudinary) via Multer.
- **Real-Time Features**: Add WebSockets (via Socket.io) to provide live order tracking updates to the frontend.
- **Admin Dashboard**: Build a dedicated interface for store admins to manage inventory, view analytics, and process refunds.

## 🛡 4. Infrastructure & DevEx

- **Testing Strategy**: Implement unit and integration tests.
  - *Backend*: Jest and Supertest.
  - *Frontend*: React Testing Library and Cypress for End-to-End flows.
- **Proper Logging**: Replace `console.log` with a structured logger like **Winston** or **Pino**. Ensure logs are easily parsed by monitoring tools.
- **API Documentation**: Integrate **Swagger (OpenAPI)** via `swagger-ui-express` so new developers know exactly what endpoints exist and what they return.
- **Robust Rate Limiting**: Move the current rate limiting middleware to use a **Redis** store so it works accurately across multiple server instances/serverless functions.
