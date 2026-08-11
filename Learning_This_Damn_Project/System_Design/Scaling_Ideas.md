# TechFreak: Scaling Ideas

As TechFreak grows, the current architecture will hit bottlenecks. This document outlines a roadmap for scaling the system to handle millions of users and high traffic loads.

## 🗄 Database Scaling

MongoDB is great for flexible schemas, but as data grows:
- **Connection Pooling**: Vercel serverless functions open and close connections rapidly. Implement robust connection pooling outside the handler function to prevent exhausting MongoDB connections.
- **Read Replicas**: Separate read and write operations. The backend can route analytical queries or product catalog reads to secondary replicas.
- **Sharding**: If the `Products` or `Orders` collections grow beyond single-node capacity, implement sharding (e.g., shard by `category` or user region) to distribute the data.

## 🚀 Caching Layer

Currently, the app queries the database for every request.
- **Redis Integration**: Introduce Redis to cache frequent, computationally expensive read operations (e.g., the homepage product list, category listings).
- **Session/Rate Limiting**: Move rate limiting (currently in-memory, which resets on every serverless instance spin-up) to Redis for a unified, global rate-limiting policy.

## 🌍 CDN and Static Assets

- **CDN for Assets**: Ensure all static assets, especially user-uploaded images and product photos, are served via a CDN (like Cloudflare or AWS CloudFront) rather than being fetched from the backend.
- **Image Optimization**: On-the-fly resizing and WebP conversion.

## 🤖 ML Service Scaling

The current ML service is stateless and recomputes TF-IDF embeddings on *every request*. This is a massive scalability bottleneck.
- **Pre-computed Embeddings**: Run a cron job to compute product embeddings nightly or upon product creation, and store them in the database.
- **Vector Database**: Use a dedicated Vector DB (like Pinecone, Milvus, or even MongoDB Atlas Vector Search) to store and query embeddings efficiently.
- **Model Caching**: If dynamic inference is needed, load the model into memory once at startup, not per request.

## 📨 Queue-Based Architecture

Background tasks currently run synchronously or in the same execution context as the web request.
- **Message Broker**: Introduce RabbitMQ, Kafka, or AWS SQS.
- **Decoupled Workers**: 
  - Offload **order processing** and **invoice generation** to a queue.
  - Move **Nodemailer** email sending to a queue so the user isn't waiting for the SMTP server to respond before their HTTP request finishes.
  - Isolate the **Puppeteer scraping** logic into an asynchronous background worker.

## 🔍 Search Architecture

Currently, product search relies on a `$regex` query in MongoDB, which is slow and unscalable.
- **Dedicated Search Engine**: Implement Elasticsearch or Algolia to handle typos, faceted search, synonyms, and blazing-fast response times.
- **MongoDB Text Search**: At a minimum, utilize the currently unused Text Index defined in the Mongoose schema.

## 🏗 Architectural Evolution

- **Microservices**: Break the monolithic Express app into smaller domains (e.g., `User Service`, `Order Service`, `Catalog Service`).
- **Containerization**: Move away from Vercel Serverless for the backend. Containerize the Express app using **Docker** and deploy it on **Kubernetes (K8s)** or AWS ECS. This solves cold starts and gives predictable performance for background tasks.
- **CI/CD Pipeline**: Implement GitHub Actions to automate testing, linting, and deployment of these containers.
