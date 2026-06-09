require('dotenv').config();
// 1. IMPORT THE STEALTH PLUGINS
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const mongoose = require('mongoose');

// Point this to your actual Mongoose model
const Product = require('./model/productModel'); 

const DB_URL = process.env.VITE_BACKEND_URL || "mongodb://localhost:27017/tech-freak";

// The URL we want to scrape
const TARGET_URL = 'https://www.newegg.com/p/pl?d=gaming+keyboard'; 

async function scrapeAndSeed() {
  console.log('🔌 Connecting to Database...');
  await mongoose.connect(DB_URL);
  console.log('✅ Connected to MongoDB');

  console.log('🕵️‍♂️ Launching VISIBLE stealth browser...');
  // 2. TURN OFF HEADLESS MODE so we can see what the website is doing
  const browser = await puppeteer.launch({ 
    headless: false, // You will see the Chromium window pop up!
    defaultViewport: null 
  });
  const page = await browser.newPage();

  // Pretend to be a real user
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  console.log(`🌐 Navigating to ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' }); 

  console.log('⏳ Waiting for product grid to load on screen...');
  
  try {
    // 3. WAIT FOR THE DOM TO PAINT. Don't scrape until the items physically exist!
    // We are checking for either .item-cell or .item-container (Newegg uses both)
    await page.waitForSelector('.item-cell, .item-container', { timeout: 10000 });
  } catch (err) {
    console.log('⚠️ Warning: Timed out waiting for products. A CAPTCHA might be blocking us.');
  }

  console.log('🔍 Scraping products...');
  
  const scrapedProducts = await page.evaluate(() => {
    const items = [];
    // Target both potential class names Newegg uses
    const productNodes = document.querySelectorAll('.item-cell, .item-container'); 

    productNodes.forEach((node, index) => {
      if (index >= 20) return; 

      const titleNode = node.querySelector('.item-title');
      const priceNode = node.querySelector('.price-current strong');
      const imageNode = node.querySelector('.item-img img');

      if (titleNode && priceNode && imageNode) {
        const title = titleNode.innerText;
        const priceString = priceNode.innerText.replace(/,/g, ''); 
        const priceValue = parseFloat(priceString) || 49.99;
        const imageUrl = imageNode.src;

        items.push({
          asin: `TECH_KB_${Math.floor(Math.random() * 100000)}`, 
          title: title,
          description: `High-performance ${title} perfect for your setup.`,
          brand: title.split(' ')[0], 
          image: imageUrl,
          rating: (Math.random() * 1.5 + 3.5).toFixed(2), 
          categories: [{ name: "Keyboards", id: "99123" }],
          price: {
            value: priceValue,
            name: `$${priceValue}`,
            symbol: "$"
          }
        });
      }
    });
    
    return items;
  });

  console.log(`🚀 Successfully scraped ${scrapedProducts.length} items!`);
  await browser.close(); 

  if (scrapedProducts.length > 0) {
    console.log('💾 Saving to MongoDB...');
    try {
      // { ordered: false } tells Mongo to skip duplicates and keep going!
      await Product.insertMany(scrapedProducts, { ordered: false });
      console.log('🎉 SUCCESS! Real-world tech products have been added to your database.');
    } catch (err) {
      // With ordered: false, Mongo will still throw a warning if it skipped duplicates, 
      // but it successfully saved the rest! Let's handle that gracefully.
      if (err.code === 11000) {
        console.log(`⚠️ Notice: Skipped some duplicate products (or products already in DB), but saved the rest successfully!`);
        console.log('🎉 SUCCESS! Real-world tech products have been added to your database.');
      } else {
        console.error('❌ Error saving to database:', err);
      }
    }
  } else {
    console.log('⚠️ No products found. The website might have changed its CSS classes!');
  }

  process.exit();
}

scrapeAndSeed();