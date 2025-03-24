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

// Get single product
router.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let product = await Product.findById(id);
    if (!product) {
      product = productsJSON.find((product) => product._id === id);
      if (!product) {
        return res.status(404).json({ error: "Produkt hittades inte" });
      }
    }
    return res.json(product);
  } catch (error) {
    console.error("Error in getting product by ID:", error);
    res.status(500).json({ error: error.message });
  }
});


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

//Update product (admin only)
router.put("/products/:id",adminAuth, async (req, res) => {
  const {id} = req.params
  const body = req.body
  const productData = {
      ...body,
  }
  delete productData._id 
  try {
      const product = await Product.findByIdAndUpdate(id, {$set: productData}, {new: true })
      if(!product) {
          throw new Error("Product not found")
      }
      res.json(product)
  } catch(error) {
      console.warn("Error in updating product", error)
      res.status(404).json({
          error: "Product not found"
      })
  }
} )

//Delete product (admin only)
router.delete("/products/:id",adminAuth, async (req, res) => {
  const {id} = req.params
  try {
      await Product.findByIdAndDelete(id)
      return res.status(204).json()
  } catch(error) {
      console.warn("Error in getting product", error)
      res.status(404).json({
          error: "Product not found"
      })
  }
})

export default router;
