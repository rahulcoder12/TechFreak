require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');

// UPDATE THIS PATH to wherever your product model is located
const Product = require('./model/productModel'); 

// Connect to your database
const DB_URL = process.env.VITE_BACKEND_URL || "mongodb://localhost:27017/tech-freak"; 

mongoose.connect(DB_URL)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.log('❌ DB Connection Error:', err));

const productsToInsert = [];

// We will only grab the first 20000 items to keep your DB fast and clean.
const LIMIT = 20000; 

console.log('📖 Reading Flipkart CSV...');

fs.createReadStream('./data/flipkart_com-ecommerce_sample.csv')
  .pipe(csv())
  .on('data', (row) => {
    // 1. Stop parsing if we hit our limit
    if (productsToInsert.length >= LIMIT) return; 

    // 2. THE SAFETY GUARD: Skip completely empty rows or rows missing an ID
    if (!row || !row.uniq_id) {
      return; 
    }

    // 3. Clean the Category Tree (Flipkart formats this weirdly: '["Clothing >> Women >> ..."]')
    let categoryName = "General";
    try {
      const tree = row.product_category_tree.replace(/[\[\]"]/g, '').split('>>');
      if (tree.length > 0) categoryName = tree[0].trim();
    } catch(e) {}

    // 4. Clean the Image URLs (Flipkart stores an array string: '["http://img1...","http://img2..."]')
    let imageUrl = "https://via.placeholder.com/300";
    try {
      const images = row.image.replace(/[\[\]"]/g, '').split(',');
      if (images.length > 0) imageUrl = images[0].trim();
    } catch(e) {}

    // 5. Format Price and Rating
    const priceVal = parseFloat(row.retail_price) || Math.floor(Math.random() * 100) + 19.99;
    let ratingVal = parseFloat(row.product_rating);
    if (isNaN(ratingVal)) ratingVal = (Math.random() * 2 + 3).toFixed(2); // Random 3.0 to 5.0 rating if missing

    // 6. Build the Object to match your Mongoose Schema
    productsToInsert.push({
      asin: String(row.uniq_id).substring(0, 10).toUpperCase(), 
      title: row.product_name || "Unknown Product",
      description: row.description || "No description available.",
      brand: row.brand || categoryName,
      image: imageUrl,
      rating: ratingVal,
      categories: [{
        name: categoryName,
        id: Math.floor(Math.random() * 100000).toString()
      }],
      price: {
        value: priceVal,
        name: `$${priceVal}`,
        symbol: "$"
      }
    });
  })
  .on('end', async () => {
    console.log(`🧹 Parsed ${productsToInsert.length} products. Injecting into database...`);
    
    try {
      // Blast the new products into MongoDB in one giant batch
      await Product.insertMany(productsToInsert);
      
      console.log('🚀 SUCCESS! 20,000 Flipkart products have been seeded into your database.');
      process.exit();
    } catch (error) {
      console.error('❌ Error saving to database:', error);
      process.exit(1);
    }
  });