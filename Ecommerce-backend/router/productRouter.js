const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");
const authController = require("../controller/authController");
const Limiter = require("../utils/rateLimit");


router.get('/:id/recommendations', productController.getRecommendations);
// 1. PUBLIC ROUTES
router.use(Limiter(5 * 60 * 1000, 400));

// ✅ FIXED: Search must be above the dynamic ID route
router.route("/search").get(productController.searchProduct);

// Now the dynamic route won't "swallow" the search request
router.route("/:asin/:id").get(productController.getProduct);

router.route("/").get(productController.getProducts);

router
  .route("/getProductsFromCategory")
  .get(productController.getProductsFromCategory);

// 2. PROTECTED ROUTES
router.use(authController.protected);
router.use(Limiter(5 * 60 * 1000, 150));

router
  .route("/addToCart")
  .patch(authController.isActive, productController.addProductToCart);
  
router
  .route("/deleteProductFromCart")
  .patch(authController.isActive, productController.deleteProductFromCart);
  
router.route("/getProductsFromCart").get(productController.getProductsFromCart);

module.exports = router;