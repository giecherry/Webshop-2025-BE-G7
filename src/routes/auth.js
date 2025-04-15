import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import { auth } from "../middleware/auth.js";
import e from "express";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).json({ error: 'Användarnamnet är redan upptaget. Välj ett annat.' });
    }

    const user = new User(req.body);
    await user.save();


    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
      { refreshToken: true }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    res
      .status(400)
      .json({ error: error.message });
  }
});

//Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        error: "Invalid username or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );
    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
      { refreshToken: true }
    );

    res.json({ token });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message });
  }
});

// Check if token is user or admin
router.get("/me", auth, (req, res) => {
  try {
    const { id, isAdmin } = req.user;

    res.status(200).json({
      message: "Token is valid",
      user: {
        id,
        isAdmin,
        role: isAdmin ? "admin" : "user",
      },
    });
  } catch (error) {
    console.error("Error in /me route:", error);
    res
      .status(500)
      .json({ error: "Failed to verify token" });
  }
});

// Check if username is available
router.post('/check-username', async (req, res) => {
  const { username } = req.body; 

  if (!username) {
    return res.status(400).json({ error: 'Användarnamn krävs.' });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(200).json({ available: false, message: 'Användarnamnet är redan upptaget.' });
  }

  res.status(200).json({ available: true, message: 'Användarnamnet är tillgängligt.' });
});

export default router;