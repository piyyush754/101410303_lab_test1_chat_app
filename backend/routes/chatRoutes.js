const express = require("express");
const GroupMessage = require("../models/GroupMessage");
const PrivateMessage = require("../models/PrivateMessage");

const router = express.Router();

// Send Group Message
router.post("/group-message", async (req, res) => {
  try {
    const { from_user, room, message } = req.body;
    const newMessage = new GroupMessage({ from_user, room, message });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Group Messages for a Room
router.get("/group-messages/:room", async (req, res) => {
  try {
    const messages = await GroupMessage.find({ room: req.params.room });
    res.json(messages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
