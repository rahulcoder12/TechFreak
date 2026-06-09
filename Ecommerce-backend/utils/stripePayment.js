const catchAsync = require("./catchAsync");
const createError = require("http-errors");
const products = require("../model/productModel");
const users = require("../model/userModel");
const express = require("express");

module.exports = catchAsync(async (req, res, next) => {
  if (!req.body.id)
    return next(createError(404, "The page you're looking for does not exist"));
    
  const foundProduct = await users
    .findOne(
      { products: { $elemMatch: { _id: req.body.id } }, _id: req.user._id },
      { "products.$": 1 }
    )
    .populate("products.products");

  if (!foundProduct)
    return next(createError(404, "We could not find the product you requested"));
    
  const product = foundProduct.products[0].products;
  
  // Safely parse the actual price of the product
  const actualPrice = parseFloat(product.price.value || product.price.name.slice(1));
  
  // Connect to Stripe using the exact .env variable name
  const stripe = require("stripe")(process.env.STRIPE_KEY);
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.floor(actualPrice * 100), // Correctly converts the dynamic price to cents
    currency: "usd",
    payment_method_types: ["card"],
    metadata: {
      productTitle: product.title,
      productPrice: actualPrice,
      productImg: product.image,
      productId: req.body.id,
    },
  });
  
  res.status(200).json({ paymentIntent });
});