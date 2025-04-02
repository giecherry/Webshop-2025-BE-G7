import express from "express";
import Category from "../models/Category.js"; 
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error("Error in getting categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Create a new category (Admin only)
router.post("/categories", adminAuth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: "Category name and description needed" });
    }
    
    const category = new Category({ name, description });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a category (Admin only)
router.put("/categories/:id", adminAuth, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const category = await Category.findByIdAndUpdate(id, { name }, { new: true });
    if (!category) {
      return res.status(404).json({ error: "Kategori hittades inte" });
    }
    res.json(category);
  } catch (error) {
    console.error("Error in updating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a category (Admin only)
router.delete("/categories/:id", adminAuth, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const productsInCategory = await Product.find({ category: categoryId });
    if (productsInCategory.length > 0) {
      console.warn(
        `Warning: This category has ${associatedProducts.length} products.`
      );
    await Product.updateMany(
        { category: categoryId },
        { $set: { category: null } }
      );
    }

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({
      message: "Category deleted successfully",
      warning: productsInCategory.length > 0? `Warning: ${productsInCategory.length} products had their category set to null.`
        : undefined,
    });
  } catch (error) {
    console.error("Error in deleting category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
