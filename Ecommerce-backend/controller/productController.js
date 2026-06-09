const catchAsync = require('../utils/catchAsync');
const products = require('../model/productModel');
const user = require('../model/userModel');
const createError = require('http-errors');

function sendResponse(res, code, message, data) {
  return res.status(code).json({
    message,
    data: { ...data },
  });
}

// --- ML MATH HELPERS (Recommendation Engine) ---
function getTermFrequency(text) {
  const words = text.toLowerCase().match(/\w+/g) || [];
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  return frequency;
}

function calculateCosineSimilarity(freq1, freq2) {
  const uniqueWords = new Set([...Object.keys(freq1), ...Object.keys(freq2)]);
  let dotProduct = 0, magnitude1 = 0, magnitude2 = 0;
  
  for (let word of uniqueWords) {
    const val1 = freq1[word] || 0;
    const val2 = freq2[word] || 0;
    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  }
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}
// -----------------------------------------------

// --- UPDATED DYNAMIC HOME PAGE CONTROLLER ---
exports.getProducts = catchAsync(async (req, res, next) => {
  // 1. Get a list of all unique categories currently in your database
  const uniqueCategories = await products.distinct("categories.name");
  
  const homeProducts = {};

  // 2. Loop through them and grab 8 random products for each category
  for (const category of uniqueCategories) {
    const items = await products.aggregate([
      { $match: { categories: { $elemMatch: { name: category } } } },
      { $sample: { size: 8 } },
    ]);
    
    // Only add it to the frontend payload if the category actually has products!
    if (items.length > 0) {
      homeProducts[category] = items;
    }
  }
  
  // 3. Send the entire dynamic object to the frontend
  sendResponse(res, 200, 'products loaded', homeProducts);
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await products.findOne({
    _id: req.params.id,
    asin: req.params.asin,
  });
  if (!product)
    return next(createError(404, 'We could not find the requested product'));
  
  const id = product.categories[0].id;
  const similarProduct = await products.aggregate([
    { $match: { categories: { $elemMatch: { id } } } },
    { $sample: { size: 8 } },
  ]);
  sendResponse(res, 200, 'Product fetched', { product, similarProduct });
});

exports.addProductToCart = catchAsync(async (req, res, next) => {
  if (!req.body.id)
    return next(createError(400, 'No product was found to add to cart'));
  if (req.user.products.length >= 5)
    return next(createError(400, 'You can only have 5 products per cart.'));

  // Scoped to current user so it doesn't block other users
  const foundProduct = await user.findOne({
    _id: req.user.id,
    products: { $elemMatch: { products: req.body.id } },
  });

  if (foundProduct) return next(createError(400, 'Product already in cart...'));

  await user.findOneAndUpdate(
    { _id: req.user.id },
    {
      $push: {
        products: {
          $each: [{ products: req.body.id, productPaid: false }],
          $position: 0,
        },
      },
    },
    { new: true }
  );
  
  sendResponse(res, 201, 'Product added to cart', { user: req.user });
});

exports.deleteProductFromCart = catchAsync(async (req, res, next) => {
  if (!req.body.id) return next(createError(400, 'No items found to delete'));

  // Combined call to prevent Mongoose chaining crashes
  const updatedUser = await user.findOneAndUpdate(
    { _id: req.user.id, "products._id": req.body.id },
    { $pull: { products: { _id: req.body.id } } },
    { new: true }
  );

  if (!updatedUser)
    return next(createError(400, 'We could not find that product in your cart'));
    
  sendResponse(res, 200, `product with ${req.body.id} has been deleted`);
});

exports.searchProduct = catchAsync(async (req, res, next) => {
  const query = req.query.q;
  
  // 1. Strict validation: No empty strings allowed
  if (!query || query.trim() === '' || !req.query.page)
    return next(createError(400, "Please enter a search term."));
    
  const page = +req.query.page;
  if (page <= 0 || !Number.isFinite(page))
    return next(createError(400, "Invalid page number."));

  // 2. STRICT SEARCHING: Only search Titles and Category Names. 
  const searchedProduct = await products
    .find({ 
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { "categories.name": { $regex: query, $options: 'i' } }
      ] 
    })
    .limit(8)
    .skip((page - 1) * 8);

  if (searchedProduct.length === 0)
    return next(createError(404, "We couldn't find any products matching your search."));

  sendResponse(res, 200, 'success', { searchedProduct });
});

exports.getProductsFromCart = catchAsync(async (req, res, next) => {
  const product = await user
    .findById(req.user.id)
    .populate('products.products')
    .select('products');
  sendResponse(res, 200, 'products from cart loaded', { product });
});

exports.getProductsFromCategory = catchAsync(async (req, res, next) => {
  if (!req.query.id || !req.query.page)
    return next(createError(400, 'something went wrong with the request'));
    
  const page = +req.query.page;
  if (page <= 0 || !Number.isFinite(page))
    return next(createError(400, 'something went wrong with the request'));

  const foundProducts = await products
    .find({ categories: { $elemMatch: { id: req.query.id } } })
    .limit(8)
    .skip((page - 1) * 8);

  if (foundProducts.length === 0)
    return next(createError(404, "The page you're looking for does not exist"));
    
  sendResponse(res, 200, 'products fetched', { foundProducts });
});

// --- NEW ML RECOMMENDATION CONTROLLER ---
exports.getRecommendations = catchAsync(async (req, res, next) => {
  const targetId = req.params.id;

  // 1. Fetch all products as lightweight JS objects (.lean()) for fast math processing
  const allProducts = await products.find({}).lean(); 

  // 2. Find the target product the user is looking at
  const targetProduct = allProducts.find(p => String(p._id) === String(targetId));
  
  if (!targetProduct) {
    return next(createError(404, 'We could not find the base product to generate recommendations.'));
  }

  // 3. Create the 'Tag String' and Frequency Map for the target product safely
  const targetCategories = targetProduct.categories ? targetProduct.categories.map(c => c.name).join(' ') : '';
  const targetString = `${targetProduct.title || ''} ${targetProduct.brand || ''} ${targetCategories} ${targetProduct.description || ''}`;
  const targetFreq = getTermFrequency(targetString);

  // 4. Calculate similarity scores for every other product
  const scoredProducts = allProducts
    .filter(p => String(p._id) !== String(targetId)) // Exclude the exact same item
    .map(product => {
      const productCategories = product.categories ? product.categories.map(c => c.name).join(' ') : '';
      const compareString = `${product.title || ''} ${product.brand || ''} ${productCategories} ${product.description || ''}`;
      const compareFreq = getTermFrequency(compareString);
      
      const score = calculateCosineSimilarity(targetFreq, compareFreq);
      
      return {
        ...product,
        similarityScore: score
      };
    });

  // 5. Sort by highest mathematical similarity and grab the Top 4
  const topRecommendations = scoredProducts
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 4);

  sendResponse(res, 200, 'Recommendations calculated', { recommendations: topRecommendations });
});