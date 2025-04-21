import express from "express";
import Cart from "../models/Cart.js";
import { auth } from "../middleware/auth.js";
import Product from "../models/Product.js";

const router = express.Router();

// Get user's cart
router.get("/cart", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cart = await Cart.findOne({ user: userId })
      .populate("items.product");
    
    if (!cart) {
      return res.json({ items: [] });
    }
    
    res.json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({
      error: "Failed to fetch cart: Something went wrong on the server."
    });
  }
});

// Save user's cart
router.post("/cart", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        error: "Invalid cart data: Cart items must be an array."
      });
    }
    
    // Validate items and check stock
    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          error: "Invalid cart item: Each item must have a product ID and a quantity greater than 0."
        });
      }
      
      // Verify product exists
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          error: `Product with ID ${item.product} not found.`
        });
      }
      
      // Check if quantity is within available stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Not enough stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }
    }
    
    // Update or create cart
    const cart = await Cart.findOneAndUpdate(
      { user: userId }, 
      { 
        user: userId,
        items: items,
        updatedAt: Date.now()
      },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      message: "Cart saved successfully",
      cart
    });
  } catch (error) {
    console.error("Error saving cart:", error);
    res.status(500).json({
      error: "Failed to save cart: Something went wrong on the server."
    });
  }
});

export default router; 