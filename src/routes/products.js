import express from "express";
import Product from "../models/Product.js";
import { adminAuth } from "../middleware/auth.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const router = express.Router();

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read products JSON file
const productsJSON = JSON.parse(
  readFileSync(join(__dirname, "../data/products.json"), "utf8")
);

// Get all products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    if (!products || products.length === 0)  {
      return res.json(productsJSON);
    }
    return res.json(products);
  } catch (error) {
    console.warn("Error in getting products", error)
    res.status(500).json({ error: error.message });
  }
});

//TODO Get single product

// Create product (admin only)
router.post("/products", adminAuth, async (req, res) => {
  try {
    const { name, price, description, stock } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: "Namn och pris behövs" });
    }
    const product = new Product({
      name,
      price,
      description: description || "",
      stock: stock || 0
    });
    await product.save();
    res.status(201).json({ message: "Produkt skapad", product });
  } catch (error) {
    console.error("error");
    res.status(500).json({ error: "Internal server error" });
  }
});

//TODO Update product (admin only)

//TODO Delete product (admin only)

export default router;
