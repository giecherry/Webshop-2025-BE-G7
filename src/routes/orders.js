import express from "express";
import Order from "../models/Order.js"; 
import {auth, adminAuth } from "../middleware/auth.js";


const router = express.Router();

// Get all orders (only for admins)
router.get('/orders', adminAuth, async (req, res) => {
    try {
        const orders = await Order.find().populate('user products.product');
        if (orders.length === 0) {
        return res.status(404).json({ error: 'No orders found: There are no orders in the system yet.' });
        }

    res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders: Something went wrong on the server.' });
    }
});

//Get a specific order by ID (for user that made the purchase and admins)
router.get('/orders/:id', auth, async (req, res) => {
    const { id } = req.params;
    try {
    const order = await Order.findById(id).populate('products.product');
    if (!order) {
        return res.status(404).json({ error: `Order not found: The order with ID ${id} does not exist.` });
    }
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(403).json({ error: 'Access denied: You are not authorized to view this order.' });
    }    
    res.json(order);
    } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order: Something went wrong on the server.' });
    }
});

//Make an order 
router.post('/orders', auth, async (req, res) => {
    const { items } = req.body; // body should be an array of { productId, quantity }
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Order creation failed: No items specified. Please add items to your order.' });
    }
    try {
        let totalPrice = 0;
      // Check stock for each product and calculate total price
        for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
            return res.status(404).json({ error: `Order creation failed: Product with ID ${item.product} not found.` });
        }

        if (product.stock < item.quantity) {
            return res.status(400).json({ error: `Order creation failed: Not enough stock for "${product.name}". Available stock: ${product.stock}` });
        }
        // Calculate total price for this item (price * quantity)
        totalPrice += product.price * item.quantity;
        // Reduce the stock by the purchased quantity
        product.stock -= item.quantity;
        await product.save();
        }

        const order = new Order({
        user: req.user._id,
        items: items.map(item => ({
            product: item.product,
            quantity: item.quantity
        })),
        totalPrice,
        });
        await order.save();

        res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Order creation failed: Something went wrong on the server. Please try again later.' });
    }
});

//Get all orders for a specific user (for admins and the user themselves)
router.get('/orders/user/:userId', auth, async (req, res) => {
    const { userId } = req.params;
    try {
        if (req.user._id.toString() !== userId && !req.user.isAdmin) {
        return res.status(403).json({ error: 'Access denied: You are not authorized to view orders for this user.' });
        }
        const orders = await Order.find({ user: userId }).populate('products.product');
        if (orders.length === 0) {
        return res.status(404).json({ error: 'No orders found for this user.' });
        }

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders for this user:', error);
        res.status(500).json({ error: 'Failed to fetch orders: Something went wrong on the server.' });
    }
});
