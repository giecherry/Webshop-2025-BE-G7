import express from "express";
import Order from "../models/Order.js"; 

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

