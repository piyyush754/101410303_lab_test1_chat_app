const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Ensure the correct model import

const router = express.Router();

//signup
router.post('/signup', async (req, res) => {
    try {
        const { username, firstname, lastname, password } = req.body;

        if (!username || !firstname || !lastname || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            firstname,
            lastname,
            password: hashedPassword,
            createdAt: new Date()
        });

        await newUser.save();
        res.status(201).json({ message: "User created successfully" });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});



// Login Route
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Username and password are required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ success: true, token, username: user.username });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});



module.exports = router;
