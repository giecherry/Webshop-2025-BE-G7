import express from "express";
import Product from "../models/Product.js";
import { adminAuth, auth } from "../middleware/auth.js";
import Category from "../models/Category.js";
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
    const products = await Product.find().populate('category');
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
    const { name, price, description, stock, category, imageUrl } = req.body;
    
    // Validate required fields
    if (!name || price === undefined) {
      return res.status(400).json({ error: "Namn och pris behövs" });
    }
    

    
    if (!imageUrl) {
      return res.status(400).json({ error: "Bild URL är obligatorisk" });
    }
    
    // Create product object
    const productData = {
      name,
      price,
      description: description || "",
      stock: stock || 0,
      imageUrl,
    };
    
    // Only add category if provided
    if (category) {
      // Verify that the category exists
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ error: "Angiven kategori finns inte" });
      }
      productData.category = category;
    }
    
    const product = new Product(productData);
    await product.save();
    res.status(201).json({ message: "Produkt skapad", product });
  } catch (error) {
    console.error("Error creating product:", error);
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
    // Verifiera att kategorin finns om den ingår i uppdateringen
    if (productData.category) {
      const categoryExists = await Category.findById(productData.category);
      if (!categoryExists) {
        return res.status(400).json({ error: "Angiven kategori finns inte" });
      }
    }
    
    const product = await Product.findByIdAndUpdate(
      id, 
      {$set: productData}, 
      {new: true}
    ).populate('category');
    
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

// Update stock for a product (User making a purchase)
router.put('/products/:id/stock', auth, async (req, res) => {
  const { id } = req.params; 
  const { quantity } = req.body; 

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid quantity provided' });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Not enough stock. Available stock: ${product.stock}`,
      });
    }
    product.stock -= quantity;
    await product.save();

    res.status(200).json({
      message: 'Stock updated successfully.',
      updatedStock: product.stock,
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      message: 'Something went wrong while updating the stock.',
      error: error.message,
    });
  }
});


export default router;
