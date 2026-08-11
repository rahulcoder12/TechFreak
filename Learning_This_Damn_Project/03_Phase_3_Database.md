# Phase 3: The Database Layer

Welcome to the backend! We are diving into the heart of the application—the database layer. This document will walk you through exactly how data is structured, saved, and manipulated in the TechFreak project. 

By the end of this, you’ll not only understand *what* the code does but *why* it was written that way, how to explain it in an interview, and even how to spot some "dead code."

---

## 1. MongoDB & Mongoose: The Power Duo

### What is MongoDB?
MongoDB is a **NoSQL document database**. Unlike relational databases (like PostgreSQL or MySQL) that store data in rigid tables with rows and columns, MongoDB stores data in flexible, JSON-like format called **BSON** (Binary JSON).

**Why was it chosen for TechFreak?**
E-commerce catalogs can be highly varied. A laptop might have "RAM" and "Processor" fields, while a mouse has "DPI" and "Wireless" fields. 
- **SQL** requires strict schemas (you'd need lots of tables and joins to handle all variations).
- **MongoDB** allows a flexible schema where each product document can have slightly different structures if needed. It scales horizontally well, making it great for catalogs.

### What is Mongoose?
While MongoDB is flexible, sometimes it's *too* flexible. We don't want someone creating a product without a price or a title! 

**Mongoose** is an **ODM (Object Data Modeling)** library for Node.js. It acts as a strict bouncer for your database. It enforces schemas, provides built-in validation (so bad data doesn't get saved), and gives us a simple API to query the database using JavaScript methods instead of raw database commands.

---

## 2. The Product Schema ([`productModel.js`](file:///Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend/model/productModel.js))

Let's look at how a product is defined in our database.

```javascript
const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product must have a name'], // Validator
    unique: true, // Index & Validator
  },
  details: {
    type: Array,
  },
  asin: String,
  link: String,
  categories: {}, // Mixed type, accepts anything
  image: {
    type: String,
  },
  rating: {
    type: String,
    required: true,
  },
  price: {
    type: Object, // Stores value, name, and symbol
    required: true,
  },
});
```

### Breaking it down:
- **Validators:** Notice `required: [true, '...']`. Mongoose will throw an error if you try to save a product without a title, rating, or price.
- **Data Types:** We have standard `String` and `Array` types, but also `Object` (for `price`) and an empty `{}` for `categories`, which means Mongoose allows *any* data type here (Mixed type).

### The Dead Code: The Text Index
Further down in the file, you'll see this line:
```javascript
productSchema.index({ title: 'text' });
```
**What does this do?** It tells MongoDB to create a "Text Index" on the `title` field. Text indexes make searching for words inside a string incredibly fast (e.g., if a user types "keyboard" in a search bar).
**Why is it dead code?** While it's a great idea, if you look through the controllers, you won't find a route that actually utilizes `$text` and `$search` queries to take advantage of this index. It's a great talking point for improvements!

---

## 3. The User Schema ([`userModel.js`](file:///Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend/model/userModel.js))

The User schema is much larger because it handles authentication, security, and cart references.

### Key Fields & Decisions:
- **Email Validation:** 
  It uses the `validator` library to ensure the email format is correct.
  ```javascript
  validate: {
    validator(v) { return validator.isEmail(v); },
    message: (props) => `...not a valid email address`
  }
  ```
- **Select: false:**
  Fields like `Password`, `PasswordConfirm`, `EmailConfirmToken`, and `passwordResetToken` have `select: false`. This is a crucial security decision. It means that when you query a user (e.g., `User.findById(id)`), these sensitive fields will NOT be returned by default, preventing accidental leaks to the frontend.

### Pre-Save Hooks (Password Hashing)
Before saving a user, we must hash their password so we never store plaintext passwords.

```javascript
userSchema.pre('save', async function (next) {
  if (!this.isDirectModified('Password')) return next();
  this.Password = await bcrypt.hash(this.Password, 12);
  this.PasswordConfirm = undefined; // We don't need to save the confirmation in DB
  next();
});
```
**How bcryptjs works:** 
- It uses a salt (random data added to the password before hashing) to defend against rainbow table attacks.
- The `12` represents the "cost factor" or rounds. It means the hashing algorithm is run $2^{12}$ (4,096) times. This makes it intentionally slow, so hackers can't quickly brute-force passwords.

### Instance Methods
Instance methods are custom functions attached to a specific user document.
- `verifyPassword`: Compares a plain password to the hashed DB password using `bcrypt.compare`.
- `confirmAccount`: Generates an email verification token using `rand-token`, encrypts it using `cryptr`, sets an expiry date, and emails the user.
- `forgotPassword`: Similar to `confirmAccount`, but handles the password reset flow.

---

## 4. Feeding the Beast: The Seeding Scripts

An e-commerce app is useless without products. The project uses three scripts to populate the database.

1. **[`seedTech.js`](file:///Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend/seedTech.js)**: 
   Fetches tech products from a public API (`dummyjson.com`), cleans the data to match our schema, and uses `Product.insertMany(allProducts, { ordered: false })` to insert them in bulk. `ordered: false` ensures that if one product fails (e.g., duplicate title), the rest continue to save!

2. **[`seedDatabase.js`](file:///Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend/seedDatabase.js)**: 
   Parses a massive CSV file (Flipkart data) using streams (`fs.createReadStream`). Streams are crucial here because reading a massive file into memory all at once would crash the Node.js server. It processes rows one by one.

3. **[`scrapeTech.js`](file:///Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend/scrapeTech.js)**: 
   Uses **Puppeteer** (a headless browser automation tool). It actually opens a real Chromium browser (`headless: false`), navigates to Newegg, waits for the products to load on the screen, and extracts the DOM elements (title, price, image) directly from the HTML to save to our DB. This is web scraping in action!

---

## 5. Interview Prep

Here is how you can talk about this layer in an interview.

**Q: Why did you use MongoDB instead of SQL like PostgreSQL?**
> *"I chose MongoDB because e-commerce catalogs often have varied and flexible data structures. A laptop has different specs than a t-shirt. MongoDB’s document model allowed me to iterate quickly and store varying attributes natively without having to design complex relational tables and joins. Additionally, it scales horizontally, which fits high-traffic read-heavy workloads typical of e-commerce."*

**Q: Explain how you secured user passwords.**
> *"I never store passwords in plaintext. Before saving the user to the database, I use a Mongoose 'pre-save' hook to intercept the operation. I hash the password using `bcryptjs` with a cost factor of 12. This adds a unique salt to every password and makes the hashing process computationally expensive, protecting against dictionary and brute-force attacks."*

**Q: I see you have a text index on the product title. How does indexing work?**
> *"Indexes are special data structures that store a small portion of the data (like a specific field) in an easy-to-traverse form. Without an index, the database has to scan every single document to find a match (Collection Scan). By indexing the title, queries become much faster. However, in this project, while the text index is defined in the schema, it's actually not fully utilized in the controller logic, which is something I plan to refactor to improve search performance."*

**Q: How do you handle database seeding for local development?**
> *"I built a few utility scripts. One streams a large CSV file to prevent memory bloat, another pulls data from a public API, and a third uses Puppeteer to scrape live data. I used `insertMany` with the `{ ordered: false }` flag so that duplicate key errors wouldn't crash the entire bulk insert process."*
