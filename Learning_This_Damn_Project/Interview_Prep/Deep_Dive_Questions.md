# TechFreak Interview Preparation: Deep Dive & Scenarios

This document contains deep technical questions, debugging scenarios, and 'trap' questions designed to test true understanding rather than memorization. 

## ML & Data Pipeline Questions (8 Questions)

**1. Walk me through exactly how your recommendation engine processes text.**
*Model Answer:* "When a request hits the FastAPI endpoint, it takes the input product description. Using Scikit-Learn, it passes this text into a `TfidfVectorizer`. TF-IDF looks at the frequency of a word in the specific description (Term Frequency) but penalizes words that appear everywhere across all products, like 'the' or 'laptop' (Inverse Document Frequency). This turns the text into a mathematical vector emphasizing unique keywords."

**2. Why use Cosine Similarity instead of Euclidean Distance?**
*Model Answer:* "Euclidean distance measures the straight-line distance between two points, which is highly affected by the length of the text. A short description and a long description might be far apart in Euclidean space even if they use the same words. Cosine similarity measures the *angle* between the vectors. It focuses purely on the orientation (the context/words used), making it independent of document length."

**3. Is your recommendation engine calculating similarity against the live MongoDB database on every request?**
*Model Answer:* "No, that would be incredibly slow. The FastAPI service loads a CSV or JSON dump of the product catalog into a Pandas DataFrame when the server boots up, and pre-fits the TF-IDF matrix. When a request comes in, it calculates similarity against that in-memory matrix. The trade-off is that brand new products aren't recommended until the ML service reloads its data."

**4. How do you handle cold starts in recommendations? (When a new product has no data or reviews)**
*Model Answer:* "Since my system is Content-Based (relying on text descriptions) rather than Collaborative Filtering (relying on user behavior like 'users who bought this also bought'), it actually doesn't suffer from the cold start problem. As long as a new product has a description, TF-IDF can instantly find similar items. It would be a problem if I relied on user ratings."

**5. What is the biggest limitation of your ML approach?**
*Model Answer:* "It only understands literal word overlap, not semantic meaning. If one product says 'Mobile Phone' and another says 'Cellular Device', TF-IDF might not realize they are similar. To improve this, I would need to move to Word Embeddings (like Word2Vec or BERT) which understand contextual semantics."

## Debugging & Trap Scenarios (10 Questions)

**6. TRAP QUESTION: I noticed your React app uses Redux for global state. How did you structure your reducers?**
*Model Answer:* "Actually, I didn't use Redux for this project. I chose to use SWR for server-state caching and standard React hooks like Context API for local UI state. I found Redux to be boilerplate-heavy for the scope of this e-commerce app."

**7. SCENARIO: Users are reporting that their shopping cart empties randomly while browsing. How do you debug this?**
*Model Answer:* "Since the cart relies on local state or `localStorage`, I'd check three things. First, if multiple browser tabs are open, state might be out of sync. Second, I'd check if an unhandled error in a React component is causing the app to crash and re-mount, wiping state. Third, I'd look at the Context Provider to ensure the initial state isn't accidentally overwriting `localStorage` data on re-renders."

**8. TRAP QUESTION: How did you configure Webpack in your project to handle the Sass files?**
*Model Answer:* "I didn't use Webpack. The project is scaffolded with Vite, which uses esbuild and Rollup. Vite has built-in support for Sass. All I had to do was run `npm install sass` and then I could import `.scss` files directly into my React components without configuring any loaders."

**9. SCENARIO: Your Vercel deployment succeeds, but the live site shows a blank white screen. The console says 'Unexpected token <'. What happened?**
*Model Answer:* "This usually means the React router or the static server is returning the `index.html` file when it was supposed to return a JavaScript chunk. This happens if the build path is wrong, or if a dynamic route (like `/product/123`) isn't configured for client-side routing on the hosting platform, causing the server to try to serve a directory that doesn't exist."

**10. SCENARIO: A customer complains they were charged by Stripe, but there is no order in the admin dashboard. What broke?**
*Model Answer:* "This is a disconnect between the payment gateway and the database. The most likely culprit is the Stripe Webhook. I would check the Stripe Dashboard logs to see if the webhook fired. If it fired but failed (e.g., returned a 500), it means my backend crashed while processing it—perhaps a database timeout or a bug in the Nodemailer function that runs before the order is saved. I'd check the Vercel backend logs for stack traces."

**11. SCENARIO: The backend is taking 5 seconds to return the list of products. How do you find the bottleneck?**
*Model Answer:* "I'd start by looking at the network tab to ensure it's actually TTFB (Time to First Byte) and not the frontend rendering slowly. Then, I'd check Vercel function logs to see execution time. If the function is fast but TTFB is slow, it's a cold start. If the function itself is slow, I'd run an `.explain()` on the MongoDB query to see if it's doing a COLLSCAN (collection scan) instead of using an index."

**12. TRAP QUESTION: Can you show me how you wrote the SQL join to attach reviews to products?**
*Model Answer:* "The database is MongoDB, which is a NoSQL document database, so there are no SQL joins. Instead, the reviews are embedded directly within the Product document as an array of sub-documents. If I had separated them, I would use Mongoose's `.populate()` or MongoDB's `$lookup` aggregation, but not a SQL JOIN."

**13. SCENARIO: You push a minor CSS change, but users say they don't see it unless they clear their cache. How do you fix this permanently?**
*Model Answer:* "This is an issue with asset caching. By default, Vite handles this by adding content hashes to the filenames (e.g., `main-a8f3b.css`) during the build step. If users aren't seeing updates, it means the server (Vercel) might be aggressively caching the `index.html` file itself. I need to set HTTP headers on `index.html` to `Cache-Control: no-cache`."

**14. What would you do if you realized a secret key (like Stripe Secret) was accidentally committed to GitHub?**
*Model Answer:* "First, immediately go to the Stripe dashboard and revoke/roll the API key. Second, generate a new key and update the Vercel environment variables. Third, removing it from the GitHub commit history requires tools like BFG Repo-Cleaner or `git filter-branch`, but assuming it was public even for a second, the key must be considered compromised and revoked."

**15. SCENARIO: Mongoose is throwing a `VersionError: No matching document found for id`. What does this mean?**
*Model Answer:* "This happens because of Mongoose's internal versioning key (`__v`). It's trying to save a document, but the version in the database has incremented since I fetched it. It's a concurrency issue. For example, an admin updated a product description, and milliseconds later, another admin updated the price on an older instance of the UI. Mongoose blocked it to prevent overwriting the first admin's changes."

## "What Would You Do Differently" & Trade-offs (12 Questions)

**16. If you rebuilt this today, what tech stack changes would you make?**
*Model Answer:* "I would probably swap standard React + Vite for Next.js. E-commerce relies heavily on SEO, and client-side rendering hurts indexability. Next.js App Router with Server Components would make the initial load much faster and SEO-friendly. I'd also consider using TypeScript from day one to catch type errors across the frontend and backend."

**17. What is the trade-off of using JWTs instead of Sessions?**
*Model Answer:* "JWTs are stateless, which is great for scaling because the server doesn't have to look up the session in the DB on every request. The massive trade-off is invalidation. If a user's account is compromised, you can't easily 'revoke' a JWT until it expires. You have to build a token blacklist in the database, which defeats the purpose of being stateless."

**18. You used SWR. Why not React Query (TanStack Query)?**
*Model Answer:* "SWR is incredibly lightweight and developed by Vercel, so it integrates beautifully. However, React Query is more powerful for complex mutations and has better DevTools. If the application had very complex data dependencies or required infinite scrolling, I would migrate to React Query."

**19. What is the trade-off of embedding Reviews in the Product document?**
*Model Answer:* "Read performance is amazing because it's a single query. But there are trade-offs. 1: MongoDB has a 16MB document limit. 2: If I want an admin dashboard showing 'Recent Reviews across all products', querying that from embedded arrays is messy and slow. If the project grew, I'd extract Reviews into their own collection."

**20. Why use Formik instead of React Hook Form?**
*Model Answer:* "I used Formik because I was familiar with it and it pairs nicely with Yup validation. However, React Hook Form is generally better for performance because it uses uncontrolled components, meaning the whole form doesn't re-render on every keystroke like Formik does. I'd likely switch to React Hook Form on a refactor."

**21. What did you learn about deploying Serverless functions?**
*Model Answer:* "I learned that background tasks don't work the same way. In a standard Node app on EC2, I can say `setTimeout(() => sendEmail(), 5000)` and return the HTTP response immediately. On Vercel, the moment the HTTP response is sent, the serverless function freezes. Any pending async operations (like sending an email) will be aborted. You have to `await` everything before sending the response."

**22. How would you handle multiple currencies and localization?**
*Model Answer:* "Currently, the database stores prices as raw numbers implying USD. I would need to change the schema to store prices in the lowest denomination (cents) and add a currency field. For localization, I'd use a library like `i18next` on the frontend, keeping all strings in JSON translation files rather than hardcoding English in the components."

**23. Is your application accessible (a11y)? What would you improve?**
*Model Answer:* "It has basic semantic HTML, but it's not fully accessible. I would need to run Lighthouse audits, ensure all images have descriptive `alt` tags, verify color contrast ratios, and ensure the entire checkout flow is navigable purely via keyboard. I'd also add `aria-labels` to interactive elements."

**24. What testing have you implemented?**
*Model Answer:* "Currently, it relies mostly on manual testing, which is a technical debt. I would introduce Jest and React Testing Library for component unit tests, and Cypress or Playwright for end-to-end testing of critical flows, like adding to cart and completing checkout. I'd also add API integration tests using Supertest on the Express backend."

**25. How do you handle secrets during local development versus production?**
*Model Answer:* "Locally, I use a `.env` file that is in `.gitignore`. For production, I input the environment variables directly into the Vercel dashboard. I ensure I use different databases (a local instance vs Atlas cluster) and different Stripe keys (test mode keys vs live keys) so I don't accidentally pollute production data during development."

**26. Why did you use Sass instead of CSS-in-JS (like Styled Components)?**
*Model Answer:* "Sass keeps the CSS separate from the JavaScript logic, which some find cleaner. However, CSS-in-JS scopes styles locally to the component automatically, preventing global class name collisions. I used Sass with a strict naming convention (like BEM) to avoid collisions, but Styled Components or Tailwind would have eliminated that mental overhead entirely."

**27. Walk me through how you'd scale this application to 1 million active users.**
*Model Answer:* "Frontend is on a CDN, so it scales automatically. For the backend: 1. Migrate off Serverless to a Kubernetes cluster running Dockerized Express apps for better connection pooling. 2. Implement Redis caching heavily for read operations. 3. Shard the MongoDB database, perhaps horizontally based on user geography. 4. Decouple heavy tasks (like sending batch emails) into background workers using queues (AWS SQS)."
