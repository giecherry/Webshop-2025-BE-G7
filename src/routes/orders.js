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

