// routes/recommendationRoute.js
const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");

// Global Smart Recommendations
router.get("/smart-recommendations", async (req, res) => {
  try {
    const [trendingProducts, latestProducts, lowStockProducts, categories] = await Promise.all([
      Product.find().sort({ numOfReviews: -1 }).limit(5), // Top Reviews
      Product.find().sort({ date: -1 }).limit(5),          // Latest
      Product.find({ stocks: { $lte: 5 } }).limit(5),      // Low Stock
      Category.find()                                      // All Categories
    ]);

    const productsByCategory = {};
    for (const category of categories) {
      const products = await Product.find({ category: category._id }).limit(3);
      productsByCategory[category.categoryName] = products;
    }

    res.json({
      trendingProducts,
      latestProducts,
      lowStockProducts,
      productsByCategory,
    });
  } catch (error) {
    console.error("Recommendation Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
