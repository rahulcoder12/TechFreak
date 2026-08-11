# Phase 6: Payments and Email

Handling money and sending emails are crucial components of any e-commerce application. This phase breaks down how TechFreak integrates Stripe for secure checkout and Nodemailer for automated receipt emails.

## 1. How Payment Processing Works (Stripe)

Stripe acts as the middleman between your customer's bank and your bank account.
**The flow goes like this:**
1. The **Frontend** calculates what the user wants to buy and tells the **Backend**.
2. The **Backend** creates a *PaymentIntent* with Stripe. This tells Stripe: "Hey, expect a payment of $X for Product Y."
3. Stripe returns a `client_secret` to the Backend, which passes it back to the Frontend.
4. The **Frontend** uses Stripe.js and the `client_secret` to securely collect credit card details directly from the user and sends them straight to Stripe.
5. Stripe confirms the payment and notifies your app.

> [!WARNING]
> **Golden Rule of E-Commerce:** NEVER trust the price sent from the client-side (frontend). A malicious user could modify the network request to change the price of a $1000 laptop to $1. Always calculate or verify the price on the backend.

### The Stripe Backend Code
File: [`stripePayment.js`](file:///Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend/utils/stripePayment.js)

```javascript
module.exports = catchAsync(async (req, res, next) => {
  // 1. Find the product in the user's cart from the database
  const foundProduct = await users.findOne(
    { products: { $elemMatch: { _id: req.body.id } }, _id: req.user._id },
    { "products.$": 1 }
  ).populate("products.products");
  
  const product = foundProduct.products[0].products;
  
  // 2. Extract the TRUE price directly from the database, ignoring any frontend prices
  const actualPrice = parseFloat(product.price.value || product.price.name.slice(1));
  
  const stripe = require("stripe")(process.env.STRIPE_KEY);
  
  // 3. Create the PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.floor(actualPrice * 100), // Stripe expects amounts in cents! ($10.00 = 1000)
    currency: "usd",
    payment_method_types: ["card"],
    metadata: {
      productTitle: product.title,
      productId: req.body.id,
    },
  });
  
  // 4. Send the secret to the frontend
  res.status(200).json({ paymentIntent });
});
```

---

## 2. Sending Emails (Nodemailer)

TechFreak uses Nodemailer to send emails via a Gmail SMTP server.

File: [`sendEmail.js`](file:///Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend/utils/sendEmail.js)
```javascript
const nodemailer = require("nodemailer");

async function sendEmail(to, subject, html) {
  const transport = nodemailer.createTransport({
    service: "gmail", // Nodemailer handles all standard Gmail SMTP settings automatically
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use an App Password, not your real Gmail password!
    },
  });

  await transport.sendMail({
    from: `"Tech-Freak" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
```

### Email Receipts
File: [`utilityController.js`](file:///Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend/controller/utilityController.js)

When a payment succeeds, the system triggers `sendEMail` to send an HTML receipt.
```javascript
// utilityController.js snippet
await sendMail(
  req.user.Email,
  `Order for ${product.title}`,
  `...HTML body with Order Date, Total Price, and Product Image...`
);
```

### Email Templates in the Model (A Design Critique)
File: [`userModel.js`](file:///Users/rahulbhuiya/Desktop/TechFreak/Ecommerce-backend/model/userModel.js)

Currently, the HTML for account confirmation and password resets is embedded directly inside methods in `userModel.js` (`confirmAccount` and `forgotPassword`).

> [!CAUTION]
> **Refactoring Target:** Storing raw HTML strings inside your Mongoose model makes the model file massive and hard to read. In a production app, you should extract HTML templates into separate files (like Handlebars `.hbs`, EJS, or plain `.html` files) and load them dynamically.

---

## 🎧 Interview Prep

**Q: Explain the payment flow in your application. Why don't you just process the credit card on your backend?**
**A:** "We use Stripe's PaymentIntent API. When a user checks out, my backend verifies the cart and price against the database, then creates a PaymentIntent with Stripe. Stripe gives us a client secret, which the frontend uses along with Stripe.js to securely collect card details and send them directly to Stripe. I never process cards on my backend because doing so would require strict PCI compliance (handling sensitive card data). Bypassing my server keeps the system secure and legally compliant."

**Q: How do you prevent users from tampering with prices before checking out?**
**A:** "The golden rule is to never trust client-side data for billing. In my checkout route, I only accept the `product_id` from the frontend. My backend queries the database using that ID to fetch the true, authoritative price, and then sends *that* amount to Stripe."

**Q: What is Idempotency in payment processing?**
**A:** "Idempotency ensures that if a network request fails and the frontend retries it, the user doesn't get charged twice. Stripe supports this via idempotency keys. While I didn't heavily implement manual keys in my MVP, Stripe's PaymentIntent flow inherently helps manage state so that a single intent can only result in one successful charge."

**Q: If you had more time, how would you improve your email system?**
**A:** "Right now, the HTML templates are hardcoded directly into the Mongoose user models and controllers. This violates the separation of concerns. I would extract these templates into separate files using a templating engine like Pug or Handlebars, making the logic cleaner and the emails easier to design and update."
