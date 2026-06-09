require('dotenv').config();
const mongoose = require('mongoose');

// Point this to your actual Mongoose model
const Product = require('./model/productModel'); 

// ✅ FIXED: Now correctly points to the cloud database variable!
const DB_URL = process.env.VITE_DATABASE_URI || "mongodb://localhost:27017/tech-freak";

// The exact tech categories we want from DummyJSON
// The expanded 10 tech categories!
const TECH_CATEGORIES = [
  'smartphones', 
  'laptops', 
  'tablets', 
  'mobile-accessories',
  'mens-watches',    // DummyJSON puts Apple Watches and Galaxy Fits here
  'womens-watches',  // More smartwatches and fitness trackers
  'audio',           // Headphones and speakers
  'gaming',          // Consoles and gaming mice (if available)
  'lighting',        // Smart bulbs and LED setups
  'automotive'       // Car chargers, dashcams, and GPS
];

async function fetchAndSeed() {
  console.log('🔌 Connecting to Database...');
  await mongoose.connect(DB_URL);
  console.log('✅ Connected to MongoDB');

  let allProducts = [];

  console.log('🌐 Fetching premium tech products from DummyJSON API...');

  // Fetch all products (limit 150 to grab a massive chunk)
  try {
    const response = await fetch('https://dummyjson.com/products?limit=0');
    const data = await response.json();

    // Filter out groceries, perfumes, etc. Keep ONLY the tech!
    const techItems = data.products.filter(item => 
      TECH_CATEGORIES.includes(item.category) || 
      item.category.includes('computer') || 
      item.category.includes('phone') ||
      item.category.includes('watch')
    );

    console.log(`🧹 Filtered out the junk. Formatting ${techItems.length} premium tech items...`);

    // Format them to perfectly match your Tech-Freak Mongoose Schema
    techItems.forEach(item => {
      // Capitalize the category name nicely (e.g., 'smartphones' -> 'Smartphones')
      const cleanCategory = item.category.charAt(0).toUpperCase() + item.category.slice(1).replace('-', ' ');

      allProducts.push({
        asin: `TECH_${item.id.toString().padStart(6, '0')}`, // e.g., TECH_000142
        title: item.title,
        description: item.description,
        brand: item.brand || cleanCategory,
        // Grab the highest resolution thumbnail they have
        image: item.thumbnail || (item.images.length > 0 ? item.images[0] : ''), 
        rating: item.rating.toFixed(2),
        categories: [{ 
          name: cleanCategory, 
          id: Math.floor(Math.random() * 100000).toString() 
        }],
        price: {
          value: item.price,
          name: `$${item.price.toFixed(2)}`,
          symbol: "$"
        }
      });
    });

    console.log(`💾 Injecting into MongoDB...`);
    
    // { ordered: false } prevents crashes if you run this multiple times and hit duplicates
    await Product.insertMany(allProducts, { ordered: false });
    
    console.log('🎉 SUCCESS! Your Tech-Freak database is now fully stocked.');
    
  } catch (err) {
    if (err.code === 11000) {
      console.log('⚠️ Notice: Skipped some duplicates, but the rest were added successfully!');
    } else {
      console.error('❌ Error fetching or saving:', err);
    }
  }

  process.exit();
}

fetchAndSeed();