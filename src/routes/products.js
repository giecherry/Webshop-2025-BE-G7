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

// Get products by category name or category ID
router.get("/products/category/:category", async (req, res) => {
  const { category } = req.params;

  try {
    let categoryQuery;

    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      categoryQuery = await Category.findById(category);
    } else {
      categoryQuery = await Category.findOne({ name: category });
    }

    if (!categoryQuery) {
      return res.status(404).json({ error: `Kategori '${category}' hittades inte` });
    }
    const products = await Product.find({ category: categoryQuery._id }).populate('category');

    if (!products || products.length === 0) {
     
      const fallbackProducts = productsJSON.filter(p => p.category === categoryQuery._id.toString());

      if (fallbackProducts.length === 0) {
        return res.status(404).json({ error: "Inga produkter hittades för denna kategori" });
      }

      return res.json(fallbackProducts);
    }

    return res.json(products);
  } catch (error) {
    console.error("Error in getting products by category:", error);
    res.status(500).json({ error: "Internt serverfel" });
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
      let categoryExists;
      let categoryName = category;
      
      // Pre-process the category name if it's a string
      if (typeof categoryName === 'string') {
        // Handle cases where words are joined without spaces
        categoryName = categoryName
          // Insert space before "och" if it's not already there
          .replace(/([a-zåäö])och/gi, '$1 och')
          // Insert space after "och" if it's not already there
          .replace(/och([a-zåäö])/gi, 'och $1')
          // Convert "och" to "&" to standardize format
          .replace(/ och /gi, ' & ');
      }
      
      try {
        // Step 1: Try to find by ID
        categoryExists = await Category.findById(categoryName);
      } catch (error) {
        // If error is a CastError, it means the category is not a valid ObjectId
        if (error.name === 'CastError') {
          categoryExists = null;
        } else {
          throw error; // Rethrow any other errors
        }
      }
      
      // Step 2: If not found by ID, try to find by exact name
      if (!categoryExists && typeof categoryName === 'string') {
        categoryExists = await Category.findOne({ name: categoryName });
      }
      
      // Step 3: If still not found, try case-insensitive name search
      if (!categoryExists && typeof categoryName === 'string') {
        categoryExists = await Category.findOne({ 
          name: { $regex: new RegExp(`^${categoryName}$`, 'i') } 
        });
      }
      
      // Step 4: If still not found, try to find by slug
      if (!categoryExists && typeof categoryName === 'string') {
        // Create a slug from the provided category name using the same logic as in the model
        const slugText = categoryName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/å/gi, 'a')
          .replace(/ä/gi, 'a')
          .replace(/ö/gi, 'o')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        categoryExists = await Category.findOne({ slug: slugText });
      }
      
      // Step 5: Try a more flexible search approach
      if (!categoryExists && typeof categoryName === 'string') {
        // Replace common variations and create a more flexible regex pattern
        const searchPattern = categoryName
          .toLowerCase()
          .replace(/&/g, '[&]')  // Match literal &
          .replace(/ och /g, '[ &]')  // Match both "och" and "&"
          .replace(/å/gi, '[aå]')  // Match both a and å
          .replace(/ä/gi, '[aä]')  // Match both a and ä
          .replace(/ö/gi, '[oö]'); // Match both o and ö
        
        categoryExists = await Category.findOne({
          name: { $regex: new RegExp(searchPattern, 'i') }
        });
      }
      
      if (!categoryExists) {
        return res.status(400).json({ error: "Angiven kategori finns inte" });
      }
      
      // Always store the category ID in the product
      productData.category = categoryExists._id;
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
router.put("/products/:id", adminAuth, async (req, res) => {
  const {id} = req.params
  const body = req.body
  const productData = {
      ...body,
  }
  delete productData._id 
  try {
    // Verifiera att kategorin finns om den ingår i uppdateringen
    if (productData.category) {
      let categoryExists;
      let categoryName = productData.category;
      
      // Pre-process the category name if it's a string
      if (typeof categoryName === 'string') {
        // Handle cases where words are joined without spaces
        categoryName = categoryName
          // Insert space before "och" if it's not already there
          .replace(/([a-zåäö])och/gi, '$1 och')
          // Insert space after "och" if it's not already there
          .replace(/och([a-zåäö])/gi, 'och $1')
          // Convert "och" to "&" to standardize format
          .replace(/ och /gi, ' & ');
      }
      
      try {
        // Step 1: Try to find by ID
        categoryExists = await Category.findById(categoryName);
      } catch (error) {
        // If error is a CastError, it means the category is not a valid ObjectId
        if (error.name === 'CastError') {
          categoryExists = null;
        } else {
          throw error; // Rethrow any other errors
        }
      }
      
      // Step 2: If not found by ID, try to find by exact name
      if (!categoryExists && typeof categoryName === 'string') {
        categoryExists = await Category.findOne({ name: categoryName });
      }
      
      // Step 3: If still not found, try case-insensitive name search
      if (!categoryExists && typeof categoryName === 'string') {
        categoryExists = await Category.findOne({ 
          name: { $regex: new RegExp(`^${categoryName}$`, 'i') } 
        });
      }
      
      // Step 4: If still not found, try to find by slug
      if (!categoryExists && typeof categoryName === 'string') {
        const slugText = categoryName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/å/gi, 'a')
          .replace(/ä/gi, 'a')
          .replace(/ö/gi, 'o')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        categoryExists = await Category.findOne({ slug: slugText });
      }
      
      // Step 5: Try a more flexible search approach
      if (!categoryExists && typeof categoryName === 'string') {
        // Replace common variations and create a more flexible regex pattern
        const searchPattern = categoryName
          .toLowerCase()
          .replace(/&/g, '[&]')   
          .replace(/ och /g, '[ &]')  
          .replace(/å/gi, '[aå]')  
          .replace(/ä/gi, '[aä]')  
          .replace(/ö/gi, '[oö]'); 
        
        categoryExists = await Category.findOne({
          name: { $regex: new RegExp(searchPattern, 'i') }
        });
      }
      
      if (!categoryExists) {
        return res.status(400).json({ error: "Angiven kategori finns inte" });
      }
      
      // Always store the category ID in the product
      productData.category = categoryExists._id;
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
})

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


//Search products by name or description
router.get('/products/search', async (req, res) => {
  try {
    const { q } = req.query; 

    if (!q) {
      return res.status(400).json({ error: 'Query missing' });
    }

    const products = await Product.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: q, $options: 'i' } }, 
            { description: { $regex: q, $options: 'i' } }, 
          ],
        },
      },
      {
        $project: {
          name: 1,
          price: 1,
          description: 1,
          stock: 1,
          imageUrl: 1,
        },
      },
    ]);

    if (products.length === 0) {
      return res.status(404).json({ message: 'Inga produkter matchade din sökning.' });
    }

    res.json(products); 
    console.log('Search result fetched successfully:');
  } catch (error) {
    console.error('Fel vid sökning efter produkter:', error);
    res.status(500).json({ error: 'Ett fel uppstod vid sökning efter produkter.' });
  }
});

export default router;
