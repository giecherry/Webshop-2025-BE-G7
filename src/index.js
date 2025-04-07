import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import dataMigrationRouter from '../migration/data.migration.route_module.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import User from './models/User.js';
import Order from './models/Order.js';

dotenv.config();

// Create dirname manually for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Documentation route
app.get('/api', (req, res) => {
  res.json({
    name: "Hakim Livs API",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /api/auth/register": "Register a new user",
        "POST /api/auth/login": "Login with username and password"
      },
      products: {
        "GET /api/products": "Get all products",
        "GET /api/products/:id": "Get a single product by ID",
        "POST /api/products": "Create a new product (Admin only)",
        "PUT /api/products/:id": "Update a product (Admin only)",
        "DELETE /api/products/:id": "Delete a product (Admin only)",
        "PUT /api/products/:id/stock": "Update product stock (Admin only)"
      },
      categories: {
        "GET /api/categories": "Get all categories",
        "POST /api/categories": "Create a new category (Admin only)",
        "PUT /api/categories/:id": "Update a category (Admin only)",
        "DELETE /api/categories/:id": "Delete a category (Admin only)"
      },
      orders: {
        "GET /api/orders": "Get all orders (Admin only)",
        "GET /api/orders/user/userId": "Get all orders for an specific user",
        "GET /api/orders/:id": "Get a specific order by ID (User or Admin)",
        "POST /api/orders": "Create a new order"
      },
      dataMigration: {
        "POST /api/data-migration/products/migrate": "Migrate products from JSON (Admin only)",
        "DELETE /api/data-migration/products/teardown": "Remove all products (Admin only)",
        "POST /api/data-migration/categories/migrate": "Migrate categories from JSON (Admin only)",
        "DELETE /api/data-migration/categories/teardown": "Remove all categories (Admin only)",
        "POST /api/data-migration/users/migrate": "Migrate users from JSON (Admin only)",
        "DELETE /api/data-migration/users/teardown": "Remove all users (Admin only)",
        "POST /api/data-migration/orders/migrate": "Migrate orders from JSON (Admin only)",
        "DELETE /api/data-migration/orders/teardown": "Remove all orders (Admin only)"
      }
    },
    authentication: "Use Bearer token in Authorization header for protected routes"
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);
app.use('/api', orderRoutes);

// Data Migration Routes
// Products migration
const productsDataPath = join(__dirname, "data", "products.json");
app.use(
  "/api/data-migration/products",
  dataMigrationRouter(Product, productsDataPath)
);

// Categories migration
const categoriesDataPath = join(__dirname, "data", "categories.json");
app.use(
  "/api/data-migration/categories",
  dataMigrationRouter(Category, categoriesDataPath)
);

// Users migration (if you have a users.json file)
const usersDataPath = join(__dirname, "data", "users.json");
app.use(
  "/api/data-migration/users",
  dataMigrationRouter(User, usersDataPath)
);

// Orders migration (if you have an orders.json file)
const ordersDataPath = join(__dirname, "data", "orders.json");
app.use(
  "/api/data-migration/orders",
  dataMigrationRouter(Order, ordersDataPath)
);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hakim-livs')
  .then(() => console.log('Connected to MongoDB', process.env.MONGODB_URI))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});